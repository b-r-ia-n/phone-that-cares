package com.ptc.seeglass

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.Message
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import kotlin.math.floor
import kotlin.math.min

class PlaceActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_PLACE_ID = "place_id"
        private const val TICK_MS = 2000L
        private const val UA =
            "Mozilla/5.0 (Linux; Android 14; Pixel 6) AppleWebKit/537.36 " +
                "(KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    }

    private lateinit var place: Place
    private lateinit var web: WebView
    private lateinit var container: FrameLayout
    private val handler = Handler(Looper.getMainLooper())

    // file uploads (posting photos, changing avatars)
    private var fileCallback: ValueCallback<Array<Uri>>? = null
    private val filePicker = registerForActivityResult(
        ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        fileCallback?.onReceiveValue(uris?.toTypedArray() ?: emptyArray())
        fileCallback = null
    }

    // fullscreen video (YouTube etc.)
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null

    // Session accounting: active time accumulates only while this screen is open.
    private var accumulatedMs = 0L
    private var resumedAt = 0L
    private var breaksShown = -1 // -1 = not yet initialized for this session

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        place = Places.byId(intent.getStringExtra(EXTRA_PLACE_ID) ?: "x")

        web = WebView(this)
        container = FrameLayout(this)
        container.addView(
            web,
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT
            )
        )
        setContentView(container)

        with(web.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            if (place.spoofUa) userAgentString = UA
            mediaPlaybackRequiresUserGesture = true
            loadWithOverviewMode = true
            useWideViewPort = true
            setSupportMultipleWindows(true)
        }
        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(web, true)
        }

        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView, request: WebResourceRequest
            ): Boolean {
                val url = request.url
                return if (url.scheme == "http" || url.scheme == "https") {
                    false
                } else {
                    runCatching { startActivity(Intent(Intent.ACTION_VIEW, url)) }
                    true
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                injectEnsure()
                applyProgress()
            }

            override fun doUpdateVisitedHistory(view: WebView, url: String, isReload: Boolean) {
                injectEnsure()
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                view: WebView,
                callback: ValueCallback<Array<Uri>>,
                params: FileChooserParams
            ): Boolean {
                fileCallback?.onReceiveValue(emptyArray())
                fileCallback = callback
                val mime = params.acceptTypes.firstOrNull()
                    ?.takeIf { it.isNotBlank() } ?: "*/*"
                runCatching { filePicker.launch(mime) }
                    .onFailure { fileCallback = null; return false }
                return true
            }

            // window.open (X article links etc.): route into the same view
            override fun onCreateWindow(
                view: WebView, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message
            ): Boolean {
                val temp = WebView(this@PlaceActivity)
                temp.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        v: WebView, request: WebResourceRequest
                    ): Boolean {
                        web.loadUrl(request.url.toString())
                        temp.destroy()
                        return true
                    }
                }
                (resultMsg.obj as android.webkit.WebView.WebViewTransport).webView = temp
                resultMsg.sendToTarget()
                return true
            }

            override fun onShowCustomView(view: View, callback: CustomViewCallback) {
                if (customView != null) { callback.onCustomViewHidden(); return }
                customView = view
                customViewCallback = callback
                web.visibility = View.GONE
                container.addView(
                    view,
                    FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                )
            }

            override fun onHideCustomView() {
                customView?.let { container.removeView(it) }
                customView = null
                customViewCallback?.onCustomViewHidden()
                customViewCallback = null
                web.visibility = View.VISIBLE
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                when {
                    customView != null -> web.webChromeClient?.onHideCustomView()
                    web.canGoBack() -> web.goBack()
                    else -> finish()
                }
            }
        })

        if (savedInstanceState == null) {
            web.loadUrl(place.url)
        } else {
            web.restoreState(savedInstanceState)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    override fun onResume() {
        super.onResume()
        val now = System.currentTimeMillis()
        val lastSeen = Prefs.sessionLastSeen(this, place.id)
        accumulatedMs = if (lastSeen != 0L && now - lastSeen > Care.RESET_AFTER_AWAY_MILLIS) {
            0L
        } else {
            Prefs.sessionActiveMillis(this, place.id)
        }
        resumedAt = now
        breaksShown = expectedBreakCount(effectiveElapsed())
        handler.post(ticker)
        web.onResume()
    }

    override fun onPause() {
        super.onPause()
        handler.removeCallbacks(ticker)
        val now = System.currentTimeMillis()
        accumulatedMs += now - resumedAt
        resumedAt = now
        Prefs.saveSession(this, place.id, accumulatedMs, now)
        CookieManager.getInstance().flush()
        web.onPause()
    }

    private val ticker = object : Runnable {
        override fun run() {
            applyProgress()
            maybeBreak()
            handler.postDelayed(this, TICK_MS)
        }
    }

    /** Elapsed session time with the demo multiplier applied. */
    private fun effectiveElapsed(): Long {
        val real = accumulatedMs + (System.currentTimeMillis() - resumedAt)
        val mult = if (Prefs.demoMode(this)) Care.DEMO_MULTIPLIER else 1
        return real * mult
    }

    /** Ramp used for timing (breaks, spacing). Falls back to the global
     *  default when this place's color ramp is off. */
    private fun rampMs(): Long {
        val m = Prefs.rampMinutes(this, place.id)
        val timing = if (m > 0) m else Prefs.defaultRampMinutes(this).coerceAtLeast(5)
        return timing * 60_000L
    }

    private fun colorRampEnabled(): Boolean = Prefs.rampMinutes(this, place.id) > 0

    private fun progress(): Double =
        min(1.0, effectiveElapsed().toDouble() / rampMs().toDouble())

    private fun injectEnsure() {
        val trimCss = place.trims
            .filter { Prefs.trimEnabled(this, place.id, it.id) }
            .joinToString("\n") { it.css }
        web.evaluateJavascript(CareEngine.ensureJs(place.itemSelector, trimCss), null)
    }

    private fun applyProgress() {
        val p = progress()
        val sat = if (colorRampEnabled()) 1.0 - p else 1.0
        val con = if (colorRampEnabled()) {
            1.0 - (1.0 - Care.CONTRAST_FLOOR) * p
        } else 1.0
        val space = if (place.itemSelector.isEmpty()) 0
        else floor(Care.MAX_EXTRA_SPACE_PX * p).toInt()
        injectEnsure()
        web.evaluateJavascript(CareEngine.setProgressJs(sat, con, space), null)
    }

    private fun expectedBreakCount(elapsed: Long): Int {
        val first = rampMs() * Care.BREAK_FIRST_FRACTION
        val interval = rampMs() * Care.BREAK_INTERVAL_FRACTION
        if (elapsed < first) return 0
        return 1 + floor((elapsed - first) / interval).toInt()
    }

    private fun maybeBreak() {
        if (!Prefs.breakCards(this, place.id)) return
        val expected = expectedBreakCount(effectiveElapsed())
        if (breaksShown in 0 until expected) {
            breaksShown = expected
            web.evaluateJavascript(CareEngine.showBreakJs(BreakCards.random()), null)
        } else if (breaksShown < 0) {
            breaksShown = expected
        }
    }
}

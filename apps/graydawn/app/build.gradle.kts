plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.ptc.graydawn"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.ptc.graydawn"
        minSdk = 26
        targetSdk = 34
        versionCode = 8
        versionName = "1.0"
    }

    // Shared PTC release key. Lives outside the repo (keys/ is gitignored);
    // builds stay unsigned-release-capable on machines without it.
    val ptcKeystore =
        file(System.getProperty("user.home") + "/Desktop/PhoneThatCares/keys/ptc-release.keystore")
    signingConfigs {
        if (ptcKeystore.exists()) {
            create("ptcRelease") {
                val pw = ptcKeystore.resolveSibling("ptc-release-password.txt").readText().trim()
                storeFile = ptcKeystore
                storePassword = pw
                keyAlias = "ptc"
                keyPassword = pw
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            if (ptcKeystore.exists()) {
                signingConfig = signingConfigs.getByName("ptcRelease")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
}

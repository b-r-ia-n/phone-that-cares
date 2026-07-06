package com.ptc.seeglass

object BreakCards {

    data class Card(val art: String, val line: String)

    val CARDS = listOf(
        Card(
            """
            .
           ):
           :.
          \_/
        """.trimIndent(),
            "a candle, still lit"
        ),
        Card(
            """
             ~   ~    ~
          ~     ~   ~
        ~~~~~~~~~~~~~~~~~
         ~~~~~~~~~~~~~~
        """.trimIndent(),
            "the tide doesn't hurry"
        ),
        Card(
            """
              /\
             /  \
            /    \  /\
           /      \/  \
          ~~~~~~~~~~~~~~~
        """.trimIndent(),
            "the mountains are out there"
        ),
        Card(
            """
             (  )
            (    )
             (  )
              ||
            \_||_/
        """.trimIndent(),
            "tea somewhere is steeping"
        ),
        Card(
            """
              .-.
             (   ).
            (___(__)
             ' ' '
            ' ' '
        """.trimIndent(),
            "rain on a roof you remember"
        ),
        Card(
            """
               _..._
             .:::::::.
            :::::::::::
            ':::::::::'
              ':::::'
        """.trimIndent(),
            "the moon, doing fine without us"
        ),
        Card(
            """
             >o)
             (_>   .
                    .
              o)
             (>
        """.trimIndent(),
            "fish don't scroll"
        ),
        Card(
            """
…
        """.trimIndent(),
            "a pause is also a place"
        ),
        Card(
            """
              \./
            -- * --
              /'\
        """.trimIndent(),
            "you can look up anytime"
        ),
        Card(
            """
            |___|
            |   |
            |___|
             | |
            /   \
        """.trimIndent(),
            "an empty frame, for now"
        ),
        Card(
            """
              __
             /  \_
             \    \
              \_   \_
                \____\
        """.trimIndent(),
            "a paper boat goes where it goes"
        ),
        Card(
            """
             ,_  .
              \\_|
              (   )
               ) (
        """.trimIndent(),
            "a moth, drawn to softer light"
        ),
    )

    fun random(): Card = CARDS.random()
}

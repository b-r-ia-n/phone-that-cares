import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

# --- DATASET FOR THE SANKEY ---
# Values based on FY2024/2025 research:
# $20B Google-to-Apple Search Deal [7, 8]
# 30% Digital Commission [9, 10]
# 0% Physical Commission [10]

def generate_sankey():
    fig = go.Figure(data=[go.Sankey(
        node=dict(
            pad=15,
            thickness=20,
            line=dict(color="black", width=0.5),
            label=[
                "Users (Attention & Spending)",  # 0
                "Google (Ads & Search)",          # 1
                "Apple (Hardware & Platform)",    # 2
                "App Developers / Digital Services",  # 3
                "App Store / Play Store (30% Cut)",   # 4
                "Physical Retailers (0% Cut)"         # 5
            ],
            color=["#636EFA", "#EF553B", "#AB63FA", "#00CC96", "#FFA15A", "#19D3F3"]
        ),
        link=dict(
            source=[0, 0, 0, 0, 1, 0, 4],
            target=[1, 2, 3, 4, 4, 5, 3],
            value=[237, 294, 50, 96, 20, 500, 67],
            # 0->1: Users generate $237B in Google ad revenue
            # 0->2: Users spend $294B on Apple hardware
            # 0->3: Users spend $50B directly with app developers
            # 0->4: Users spend $96B through App Store (Apple services)
            # 1->4: Google pays Apple $20B search deal (default search on iPhone)
            # 0->5: Users spend $500B on physical goods (no platform tax)
            # 4->3: App Store passes $67B to developers (after 30% cut)
            label=[
                "Ad Revenue ($237B)",
                "Device Sales ($294B)",
                "Direct Digital Spend ($50B)",
                "App Store Revenue ($96B)",
                "Search Deal ($20B)",
                "Physical Purchases ($500B)",
                "Developer Payout after 30% Cut ($67B)"
            ],
            color=[
                "rgba(239,85,59,0.3)",
                "rgba(171,99,250,0.3)",
                "rgba(0,204,150,0.3)",
                "rgba(255,161,90,0.3)",
                "rgba(239,85,59,0.4)",
                "rgba(25,211,243,0.3)",
                "rgba(0,204,150,0.3)"
            ]
        )
    )])

    fig.update_layout(
        title_text="The Flow of Favors: Digital vs. Physical Economy",
        font_size=12,
        title_font_size=16
    )
    fig.write_html("toll_booth_sankey.html")
    print("Generated: toll_booth_sankey.html")


# --- DATASET FOR THE TREE MAP ---
# Apple FY2024: Hardware Revenue $294B (37% margin), Services $96B (74% margin) [11]
def generate_treemap():
    data = {
        'Segment': ['Apple Total', 'Hardware ($294B)', 'Services ($96B)'],
        'Parent': ['', 'Apple Total', 'Apple Total'],
        'Revenue': [390, 294, 96],
        'Margin': [37.2, 65.0, 100.0]  # Weighted estimated margins
    }
    df = pd.DataFrame(data)

    fig = px.treemap(
        df,
        path=['Parent', 'Segment'],
        values='Revenue',
        color='Margin',
        color_continuous_scale='RdYlGn',
        title='Apple Revenue Size vs. Margin Density (2024)<br><sup>Services are smaller but far more profitable - incentivizing engagement over well-being</sup>'
    )
    fig.write_html("revenue_margin_treemap.html")
    print("Generated: revenue_margin_treemap.html")


if __name__ == "__main__":
    generate_sankey()
    generate_treemap()

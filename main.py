import streamlit as st
import streamlit.components.v1 as components
import os
import urllib.parse

# 5. WIDE LAYOUT: Call st.set_page_config(layout="wide") at the absolute top of the script
st.set_page_config(
    page_title="Exchange Point - Certified Pre-owned Cars",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 3. MULTI-PAGE ROUTING VIA SIDEBAR: Create a simple dynamic router using a Streamlit sidebar radio selector
st.sidebar.title("Navigation")
selected_page = st.sidebar.radio(
    "Go to page:",
    options=["Home", "Buy Cars", "Sell Car", "Car Details"]
)

# Map page names to corresponding HTML files
page_mapping = {
    "Home": "index.html",
    "Buy Cars": "inventory.html",
    "Sell Car": "sell.html",
    "Car Details": "car-details.html"
}

filename = page_mapping[selected_page]

# Check root and static/ directories for the HTML file
html_path = filename
if not os.path.exists(html_path):
    html_path = os.path.join("static", filename)

# 4. FILE READING & CONFIG: Read the chosen HTML file safely
if not os.path.exists(html_path):
    st.error(f"Error: HTML template '{filename}' not found.")
    st.stop()

try:
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()
except Exception as e:
    st.error(f"Error loading {filename}: {str(e)}")
    st.stop()

# Enable URL query parameter syncing to supply parameters inside the iframe component
query_params = dict(st.query_params)
# Handle default ID for car details page to ensure it loads a car if none is specified
if selected_page == "Car Details" and "id" not in query_params:
    query_params["id"] = "1"

query_str = "?" + urllib.parse.urlencode(query_params) if query_params else ""

# Inject base href pointing to Streamlit's static assets endpoint & pass URL query parameters
base_tag = '<base href="/app/static/">'
injection_script = f"""
<script>
    // Supply parent URL query parameters to the iframe context
    window.iframeQueryString = "{query_str}";
</script>
"""

if "<head>" in html_content:
    html_content = html_content.replace("<head>", f"<head>\n    {base_tag}\n    {injection_script}", 1)
else:
    html_content = f"{base_tag}\n{injection_script}\n{html_content}"

# If on the Car Details page, add a handy input selector in the sidebar to change cars easily
if selected_page == "Car Details":
    current_id = query_params.get("id", "1")
    car_id_input = st.sidebar.text_input("View Car ID (1-6):", value=current_id)
    if car_id_input != current_id:
        st.query_params["id"] = car_id_input
        st.rerun()

# Hide default Streamlit style wrappers and scrollbars to maximize the layout
st.markdown(
    """
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container {padding: 0 !important; max-width: 100% !important;}
    iframe {border: none; width: 100%; height: 95vh; margin: 0; padding: 0;}
    </style>
    """,
    unsafe_allow_html=True
)

# 2. NATIVE STREAMLIT RENDERING: Render via components.html
components.html(html_content, height=1200, scrolling=True)

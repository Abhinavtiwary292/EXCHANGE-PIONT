import streamlit as st
import http.server
import socketserver
import threading
import socket
import os

# Find an available port on the host machine
def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

# Run a simple HTTP server in a background thread serving the current workspace folder
@st.cache_resource
def start_server(port):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass # Mute local logs in streamlit output stream
            
    # Set the serving directory to the folder containing this app.py
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    
    httpd = socketserver.TCPServer(("", port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return f"http://localhost:{port}"

# Streamlit Page Setup
st.set_page_config(
    page_title="Exchange Point - Pre-owned Showroom",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# White-label styling overrides to remove default streamlit headers, footers and margins
st.markdown(
    """
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container {padding: 0 !important; max-width: 100% !important;}
    iframe {position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; border: none; margin: 0; padding: 0; overflow: hidden; z-index: 999999;}
    </style>
    """,
    unsafe_allow_html=True
)

# Start background server
port = get_free_port()
server_url = start_server(port)

# Load the local server directly in a full-viewport iframe
st.components.v1.iframe(server_url, height=900)

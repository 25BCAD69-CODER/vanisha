from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(__file__))
from database import init_database, add_contact, get_visitor_count, increment_visitor_count, get_all_contacts

app = Flask(__name__, static_folder='.')
CORS(app)

# Initialize database on startup
init_database()

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/admin')
def admin():
    """Admin page to view all contact messages"""
    contacts = get_all_contacts()

    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin — Contact Messages | Vanisha's Portfolio</title>
        <style>
            body {
                font-family: 'Segoe UI', sans-serif;
                background: #0f172a;
                color: #f1f5f9;
                padding: 32px;
            }
            h1 {
                text-align: center;
                font-size: 1.8rem;
                margin-bottom: 8px;
                background: linear-gradient(90deg, #06b6d4, #9333ea);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .count {
                text-align: center;
                color: #94a3b8;
                margin-bottom: 28px;
                font-size: 0.9rem;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                background: #1e293b;
                border-radius: 12px;
                overflow: hidden;
            }
            th, td {
                padding: 14px 18px;
                text-align: left;
                border-bottom: 1px solid rgba(255,255,255,0.06);
                font-size: 0.9rem;
            }
            th {
                background: #0f172a;
                color: #06b6d4;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-size: 0.78rem;
            }
            tr:last-child td { border-bottom: none; }
            tr:hover td { background: rgba(6,182,212,0.05); }
            td { color: #cbd5e1; }
        </style>
    </head>
    <body>
        <h1>Contact Messages</h1>
        <p class="count">Total: {{ contacts|length }} message(s)</p>
        <table>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
            </tr>
            {% for contact in contacts %}
            <tr>
                <td>{{ contact.id }}</td>
                <td>{{ contact.name }}</td>
                <td>{{ contact.email }}</td>
                <td>{{ contact.message }}</td>
                <td>{{ contact.created_at }}</td>
            </tr>
            {% endfor %}
        </table>
    </body>
    </html>
    """
    return render_template_string(html, contacts=contacts)

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# API Routes
@app.route('/api/contact', methods=['POST'])
def contact():
    """Handle contact form submissions"""
    try:
        data = request.get_json()

        # Validate input
        name    = data.get('name', '').strip()
        email   = data.get('email', '').strip()
        message = data.get('message', '').strip()

        if not name or not email or not message:
            return jsonify({'error': 'All fields are required', 'success': False}), 400

        # Basic email validation
        if '@' not in email or '.' not in email:
            return jsonify({'error': 'Invalid email address', 'success': False}), 400

        # Save to database
        success = add_contact(name, email, message)

        if success:
            return jsonify({
                'message': 'Message sent successfully! I will get back to you soon.',
                'success': True
            }), 200
        else:
            return jsonify({'error': 'Failed to save message. Please try again.', 'success': False}), 500

    except Exception as e:
        print(f"Error in contact endpoint: {e}")
        return jsonify({'error': 'Internal server error', 'success': False}), 500

@app.route('/api/stats', methods=['GET'])
def stats():
    """Return visitor statistics"""
    try:
        visitor_count = increment_visitor_count()
        return jsonify({
            'visitors': visitor_count,
            'success': True
        }), 200
    except Exception as e:
        print(f"Error in stats endpoint: {e}")
        return jsonify({'error': 'Internal server error', 'success': False}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running'
    }), 200

if __name__ == '__main__':
    print("\n" + "="*55)
    print("  Vanisha's Portfolio Server")
    print("="*55)
    print("  Local :  http://localhost:5000")
    print("  Admin :  http://localhost:5000/admin")
    print("="*55 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)

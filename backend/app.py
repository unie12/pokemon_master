from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.pokemon import pokemon_bp
from routes.auth import auth_bp


app = Flask(__name__, static_folder='static')
CORS(app)

app.register_blueprint(pokemon_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    app.run(debug=True)
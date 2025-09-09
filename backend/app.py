import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
# Isso busca a chave da API que guardamos no arquivo .env
load_dotenv()

# Inicializa o Flask, que é nosso micro-servidor web
app = Flask(__name__)
# Habilita o CORS para permitir a comunicação entre o front-end e o back-end
CORS(app)

# Configura a API do Google Gemini com a chave que pegamos do .env
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('gemini-pro')
    print("API do Google Gemini configurada com sucesso.")
except Exception as e:
    print(f"Erro ao configurar a API do Google: {e}")
    # Se a API não puder ser configurada, o servidor não deve continuar
    model = None

# Define a rota '/chat' que vai receber as mensagens do front-end
@app.route('/chat', methods=['POST'])
def chat():
    # Verifica se o modelo foi inicializado corretamente
    if model is None:
        return jsonify({"error": "O modelo de IA não foi inicializado. Verifique a chave da API."}), 500

    # Pega a mensagem do usuário que veio do front-end
    user_message = request.json.get('message')

    # Se não houver mensagem, retorna um erro
    if not user_message:
        return jsonify({"error": "Nenhuma mensagem recebida."}), 400

    try:
        # Envia a mensagem do usuário para o modelo Gemini e obtém a resposta
        response = model.generate_content(user_message)
        
        # Retorna a resposta do modelo para o front-end
        return jsonify({"response": response.text})

    except Exception as e:
        # Em caso de erro na API, informa o front-end
        print(f"Erro na API do Gemini: {e}")
        return jsonify({"error": f"Erro ao se comunicar com a IA: {e}"}), 500

# Ponto de entrada para rodar o servidor
if __name__ == '__main__':
    # Roda o servidor na porta 5000 e o torna acessível na sua rede local
    app.run(host='0.0.0.0', port=5000, debug=True)


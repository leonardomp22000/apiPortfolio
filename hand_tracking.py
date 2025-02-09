# import cv2

# cap = cv2.VideoCapture(0)  # Abre la cámara

# while cap.isOpened():
#     ret, frame = cap.read()
#     if not ret:
#         break

#     # Aquí iría tu código de procesamiento de OpenCV
#     cv2.imshow("Hand Tracking", frame)

#     if cv2.waitKey(1) & 0xFF == ord("q"):
#         break

# cap.release()
# cv2.destroyAllWindows()
# print("Hand tracking stopped")









# import sys
# import cv2
# import numpy as np
# import base64
# import mediapipe as mp

# # Inicializar Mediapipe
# mpHands = mp.solutions.hands
# hands = mpHands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)
# mpDraw = mp.solutions.drawing_utils

# while True:
#     # Leer el frame desde stdin
#     line = sys.stdin.readline().strip()
#     if not line:
#         continue

#     # Decodificar la imagen
#     try:
#         img_data = base64.b64decode(line.split(",")[1])
#         np_arr = np.frombuffer(img_data, np.uint8)
#         frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

#         # Convertir la imagen a RGB para Mediapipe
#         imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = hands.process(imgRGB)

#         # Dibujar los puntos de la mano si se detecta alguna
#         if results.multi_hand_landmarks:
#             for handLms in results.multi_hand_landmarks:
#                 mpDraw.draw_landmarks(frame, handLms, mpHands.HAND_CONNECTIONS)

#         # Codificar la imagen procesada para enviarla al frontend
#         _, buffer = cv2.imencode(".jpg", frame)
#         processed_img = base64.b64encode(buffer).decode("utf-8")

#         # Enviar la imagen procesada a Node.js
#         print(f"data:image/jpeg;base64,{processed_img}", flush=True)
    
#     except Exception as e:
#         print(f"Error: {e}", flush=True)

import sys
import cv2
import numpy as np
import base64
import json
import mediapipe as mp

mpHands = mp.solutions.hands
hands = mpHands.Hands()
mpDraw = mp.solutions.drawing_utils

while True:
    # Leer el frame desde stdin
    line = sys.stdin.readline().strip()
    if not line:
        continue

    try:
        # Decodificar la imagen
        img_data = base64.b64decode(line.split(",")[1])
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Procesamiento con OpenCV (Ejemplo: convertir a escala de grises)
        # Redimensionar la imagen a un cuadrado de 256x256 antes de procesarla
        #frame = cv2.resize(frame, (256, 256))

        imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(imgRGB)

        if results.multi_hand_landmarks:
            for handLms in results.multi_hand_landmarks:
                mpDraw.draw_landmarks(frame, handLms, mpHands.HAND_CONNECTIONS)

        # Codificar la imagen procesada
        _, buffer = cv2.imencode(".jpg", frame)
        processed_img = base64.b64encode(buffer).decode("utf-8")

        # Enviar JSON estructurado
        output_json = json.dumps({"processed_frame": f"data:image/jpeg;base64,{processed_img}"})
        print(output_json, flush=True)

    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)

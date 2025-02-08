import cv2

cap = cv2.VideoCapture(0)  # Abre la cámara

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Aquí iría tu código de procesamiento de OpenCV
    cv2.imshow("Hand Tracking", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
print("Hand tracking stopped")

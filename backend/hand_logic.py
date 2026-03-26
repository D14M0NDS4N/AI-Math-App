import cv2
import mediapipe as mp
import math
import numpy as np

# --- 1. KONFIGURASI MEDIAPIPE ---
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# --- 2. FUNGSI MATEMATIKA (Sama dengan Frontend) ---

def calculate_distance(p1, p2):
    """
    Menghitung Euclidean Distance antara dua titik (x,y).
    Rumus: d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
    """
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)

def calculate_angle(a, b, c):
    """
    Menghitung Sudut menggunakan Vector Dot Product.
    a, b, c adalah koordinat (x, y). Sudut dihitung pada titik b.
    """
    a = np.array(a) # Titik Ujung 1
    b = np.array(b) # Titik Sudut (Vertex)
    c = np.array(c) # Titik Ujung 2

    ba = a - b
    bc = c - b

    # Dot Product & Magnitude
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    
    # Clip untuk menghindari error floating point di luar -1 s.d 1
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    
    return np.degrees(angle)

def count_fingers(landmarks):
    """
    Menghitung jumlah jari yang terangkat berdasarkan posisi Y (tinggi)
    relatif terhadap ruas jari (pip).
    """
    finger_tips = [8, 12, 16, 20] # Index, Middle, Ring, Pinky
    finger_pips = [6, 10, 14, 18]
    count = 0

    # Cek 4 jari
    for tip, pip in zip(finger_tips, finger_pips):
        # Di OpenCV y=0 ada di atas, jadi y_tip < y_pip berarti jari naik
        if landmarks[tip].y < landmarks[pip].y:
            count += 1
            
    # Cek Jempol (berdasarkan jarak horizontal/X)
    # Asumsi tangan kanan: jika tip jempol lebih ke kiri dari ruasnya
    thumb_tip = landmarks[4]
    thumb_ip = landmarks[3]
    thumb_mcp = landmarks[2]
    
    # Logika sederhana jempol (bisa disesuaikan L/R)
    # Menggunakan Euclidean distance ke kelingking sebagai referensi "lebar"
    pinky_mcp = landmarks[17]
    
    dist_tip_pinky = math.hypot(thumb_tip.x - pinky_mcp.x, thumb_tip.y - pinky_mcp.y)
    dist_ip_pinky = math.hypot(thumb_ip.x - pinky_mcp.x, thumb_ip.y - pinky_mcp.y)
    
    if dist_tip_pinky > dist_ip_pinky:
        count += 1
        
    return count

# --- 3. PROGRAM UTAMA ---

def main():
    cap = cv2.VideoCapture(1) # Buka Webcam
    
    with mp_hands.Hands(
        model_complexity=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5,
        max_num_hands=2
    ) as hands:
        
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                print("Kamera tidak ditemukan.")
                continue

            # Konversi BGR ke RGB untuk MediaPipe
            image.flags.writeable = False
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(image)

            # Konversi balik ke BGR untuk OpenCV rendering
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            h, w, _ = image.shape

            total_fingers = 0

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Gambar Skeleton Tangan
                    mp_draw.draw_landmarks(
                        image,
                        hand_landmarks,
                        mp_hands.HAND_CONNECTIONS,
                        mp_drawing_styles.get_default_hand_landmarks_style(),
                        mp_drawing_styles.get_default_hand_connections_style()
                    )

                    # Ambil Koordinat Penting (Pixel)
                    wrist = (int(hand_landmarks.landmark[0].x * w), int(hand_landmarks.landmark[0].y * h))
                    thumb_tip = (int(hand_landmarks.landmark[4].x * w), int(hand_landmarks.landmark[4].y * h))
                    index_mcp = (int(hand_landmarks.landmark[5].x * w), int(hand_landmarks.landmark[5].y * h))
                    index_tip = (int(hand_landmarks.landmark[8].x * w), int(hand_landmarks.landmark[8].y * h))

                    # 1. Hitung Jarak (Jempol - Telunjuk)
                    dist = calculate_distance(thumb_tip, index_tip)
                    
                    # 2. Hitung Sudut (Telunjuk)
                    angle = calculate_angle(wrist, index_mcp, index_tip)
                    
                    # 3. Hitung Jari
                    fingers = count_fingers(hand_landmarks.landmark)
                    total_fingers += fingers

                    # --- VISUALISASI ---
                    # Garis Jarak
                    cv2.line(image, thumb_tip, index_tip, (255, 255, 0), 2) # Cyan
                    cv2.putText(image, f"Dist: {int(dist)}", ((thumb_tip[0]+index_tip[0])//2, (thumb_tip[1]+index_tip[1])//2), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

                    # Teks Sudut
                    cv2.putText(image, f"Ang: {int(angle)} deg", (index_mcp[0]+10, index_mcp[1]), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

            # Tampilkan Total Jari (Jawaban Kuis)
            cv2.rectangle(image, (10, 10), (250, 60), (0, 0, 0), -1)
            cv2.putText(image, f"Total Jari: {total_fingers}", (20, 45), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            cv2.imshow('Backend Python - Math Logic', image)
            
            # Tekan 'q' untuk keluar
            if cv2.waitKey(5) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
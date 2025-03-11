from ultralytics import YOLO
from flask import Flask, request, jsonify, send_file, render_template
import cv2
import os
import tempfile

app = Flask(__name__)
model = YOLO('yolov8n.pt')  

@app.route('/')
def index():
    return render_template('index.html')  

@app.route('/detect', methods=['POST'])
def detect():
    video_file = request.files['video']

    temp_video_path = tempfile.mktemp(suffix='.mp4')
    video_file.save(temp_video_path)

    cap = cv2.VideoCapture(temp_video_path)
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    output_path = tempfile.mktemp(suffix='_output.mp4')
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  
    out = cv2.VideoWriter(output_path, fourcc, 30, (frame_width, frame_height))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls.item())  # Extract class ID
                label = model.names[class_id]  # Get class name
                confidence = float(box.conf.item())  

                x, y, x2, y2 = map(int, box.xyxy[0])
                w, h = x2 - x, y2 - y

                if "person" in label.lower():
                    color = (0, 255, 0)  
                elif "sports ball" in label.lower():
                    color = (0, 0, 255)  
                else:
                    color = (255, 255, 255)  

                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, f'{label} {confidence:.2f}', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        out.write(frame)

    cap.release()
    out.release()
    os.remove(temp_video_path)

    return send_file(output_path, as_attachment=True, download_name="annotated_video.mp4", mimetype='video/mp4')

if __name__ == '__main__':
    app.run(debug=True)

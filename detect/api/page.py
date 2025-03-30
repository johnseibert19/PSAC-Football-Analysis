from ultralytics import YOLO
from flask import Flask, request, jsonify, send_from_directory, send_file
import cv2
import os
import tempfile
import requests
from flask_cors import CORS
import urllib.parse
import time
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS to allow requests from both development and production frontend
CORS(app, 
     resources={
         r"/*": {
             "origins": [
                 "http://localhost:3000",  # Development
                 "https://psac-football-analysis.vercel.app",  # Production
                 "https://*.vercel.app"  # Any Vercel deployment
             ],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Accept", "Origin"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Accept", "Origin"]
         }
     },
     supports_credentials=True
)

# Create uploads directory if it doesn't exist
# Look for uploads in the Next.js project directory
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'psac-football-analysis', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
print(f"[INFO] Upload folder path: {UPLOAD_FOLDER}")

# Initialize YOLO model
try:
    model = YOLO('yolov8n.pt')
    print("[INFO] YOLO model loaded successfully")
except Exception as e:
    print(f"[ERROR] Failed to load YOLO model: {str(e)}")
    raise

@app.route('/uploads/<path:filename>')
@app.route('/uploads/<path:filename>/')
def serve_file(filename):
    """Serve processed video files"""
    print(f"[INFO] Serving file: {filename} from {UPLOAD_FOLDER}")
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(file_path):
            print(f"[ERROR] File not found: {file_path}")
            return jsonify({'error': 'File not found'}), 404
            
        return send_file(
            file_path,
            mimetype='video/mp4',
            as_attachment=False,
            conditional=True
        )
    except Exception as e:
        print(f"[ERROR] Error serving file: {str(e)}")
        return jsonify({'error': str(e)}), 404

@app.route('/upload', methods=['POST', 'OPTIONS'])
@app.route('/upload/', methods=['POST', 'OPTIONS'])
def upload_file():
    """Handle file upload"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'message': 'OK'})
        origin = request.headers.get('Origin')
        if origin in ["http://localhost:3000", "https://psac-football-analysis.vercel.app", "https://*.vercel.app"]:
            response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Origin')
            response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        if 'file' not in request.files:
            print("[ERROR] No file provided in request")
            return jsonify({'error': 'No file provided', 'success': False}), 400

        file = request.files['file']
        if file.filename == '':
            print("[ERROR] No filename provided")
            return jsonify({'error': 'No filename provided', 'success': False}), 400

        # Secure the filename
        filename = secure_filename(file.filename)
        print(f"[INFO] Processing file: {filename}")

        # Create a temporary directory for processing if it doesn't exist
        temp_dir = os.path.join(UPLOAD_FOLDER, 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        # Save the file to the uploads directory
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        print(f"[INFO] File saved to: {file_path}")

        # Return success response with file path
        response = jsonify({
            'success': True,
            'filePath': filename,
            'message': 'File uploaded successfully'
        })
        origin = request.headers.get('Origin')
        if origin in ["http://localhost:3000", "https://psac-football-analysis.vercel.app", "https://*.vercel.app"]:
            response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    except Exception as e:
        print(f"[ERROR] Error uploading file: {str(e)}")
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/detect', methods=['POST', 'OPTIONS'])
@app.route('/detect/', methods=['POST', 'OPTIONS'])
def detect():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'message': 'OK'})
        origin = request.headers.get('Origin')
        if origin in ["http://localhost:3000", "https://psac-football-analysis.vercel.app", "https://*.vercel.app"]:
            response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Origin')
            response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        print("[INFO] Received request to /detect endpoint")
        start_time = time.time()
        data = request.get_json()
        
        if not data or 'videoUrl' not in data:
            print("[ERROR] No video URL provided")
            return jsonify({
                'success': False,
                'error': 'No video URL provided'
            }), 400

        video_url = data['videoUrl']
        print(f"[INFO] Received video URL: {video_url}")

        # Extract filename from URL
        filename = os.path.basename(video_url)
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        print(f"[INFO] Looking for file at: {input_path}")

        if not os.path.exists(input_path):
            print(f"[ERROR] File not found: {input_path}")
            return jsonify({
                'success': False,
                'error': f'Video file not found: {filename}'
            }), 404

        # Open the video directly from the uploads folder
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise Exception("Error opening video file")

        # Get video properties
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        print(f"[INFO] Video properties: {frame_width}x{frame_height} @ {fps}fps, {total_frames} frames")

        # Create output video writer with H.264 codec
        output_filename = f'processed_{int(time.time())}.mp4'
        output_path = os.path.join(UPLOAD_FOLDER, output_filename)
        print(f"[INFO] Will save processed video to: {output_path}")

        # Try different codecs in order of preference
        codecs = ['avc1', 'H264', 'mp4v']
        out = None
        
        for codec in codecs:
            fourcc = cv2.VideoWriter_fourcc(*codec)
            out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))
            if out.isOpened():
                print(f"[INFO] Successfully created video writer with codec: {codec}")
                break
                
        if not out or not out.isOpened():
            raise Exception("Failed to create output video writer with any codec")

        # Process each frame
        frame_count = 0
        processing_start = time.time()
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Run YOLOv8 inference on the frame
            results = model(frame)
            
            # Draw the detections
            annotated_frame = results[0].plot()
            
            # Write the frame
            out.write(annotated_frame)
            frame_count += 1
            
            if frame_count % 30 == 0:  # Log progress every 30 frames
                elapsed = time.time() - processing_start
                fps_processing = frame_count / elapsed
                progress = (frame_count / total_frames) * 100
                print(f"[INFO] Processed {frame_count}/{total_frames} frames ({progress:.1f}%) at {fps_processing:.1f} fps")

        # Release everything
        cap.release()
        out.release()
        
        total_time = time.time() - start_time
        print(f"[INFO] Video processing completed in {total_time:.1f} seconds")

        # Return the processed video URL
        response = jsonify({
            'success': True,
            'annotatedVideoUrl': f'/uploads/{output_filename}',
            'processingTime': total_time,
            'totalFrames': frame_count
        })
        origin = request.headers.get('Origin')
        if origin in ["http://localhost:3000", "https://psac-football-analysis.vercel.app", "https://*.vercel.app"]:
            response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    except Exception as e:
        print(f"[ERROR] Error processing video: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("[INFO] Starting Flask server...")
    print(f"[INFO] Upload folder: {UPLOAD_FOLDER}")
    app.run(debug=True, host='0.0.0.0', port=5000)
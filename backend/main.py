from fastapi import FastAPI, UploadFile, File, HTTPException 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.vgg16 import preprocess_input
from tensorflow.keras.preprocessing import image
from lime import lime_image
from skimage.segmentation import mark_boundaries, slic
from PIL import Image
import io
import base64
import matplotlib.pyplot as plt
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS for Render deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "http://localhost:3000",  # Alternative local port
        "https://occusafe.tech",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model - Using absolute path for Render deployment
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "glaucoma_detection_model.keras")

# Initialize model variable
model = None

@app.on_event("startup")
async def load_model():
    """Load the model on startup"""
    global model
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        model = None

def plot_to_base64(figure):
    """Convert matplotlib figure to base64 string"""
    buf = io.BytesIO()
    figure.savefig(buf, format='png', bbox_inches='tight', dpi=150)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def process_image(image_file):
    """Load and preprocess image for model prediction"""
    try:
        image_data = image_file.file.read()
        img = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize for model
        img_resized = img.resize((224, 224))
        img_array = image.img_to_array(img_resized)
        img_array = np.expand_dims(img_array, axis=0)
        preprocessed = preprocess_input(img_array)
        
        return img, img_resized, preprocessed, img_array[0]
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=400, detail="Error processing image")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Glaucoma Detection API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"status": "healthy", "model_loaded": True}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)

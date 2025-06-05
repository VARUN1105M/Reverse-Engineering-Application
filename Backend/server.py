from flask import Flask, request, jsonify
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET
from flask_cors import CORS
import shutil

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = Path('./uploads')
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

APKTOOL_PATH = '/opt/homebrew/bin/apktool'  # Update path to apktool if incorrect


@app.route('/upload', methods=['POST'])
def upload_apk():
    print("Request received at /upload")
    
    if 'apkfile' not in request.files:
        print("Error: 'apkfile' key not in request.files")
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['apkfile']
    print("File received:", file.filename)
    
    if file.filename == '':
        print("Error: No selected file")
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.apk'):
        apk_path = UPLOAD_FOLDER / file.filename
        file.save(apk_path)
    

        decompiled_folder = UPLOAD_FOLDER / 'decompiled'
        
        # Clear the decompiled folder if it exists
        if decompiled_folder.exists():
            shutil.rmtree(decompiled_folder)
        decompiled_folder.mkdir(parents=True, exist_ok=True)

        try:
            result = subprocess.run(
                [APKTOOL_PATH, 'd', str(apk_path), '-o', str(decompiled_folder), '-f'],
                check=True, capture_output=True, text=True
            )
            print("APKTool stdout:", result.stdout)  
            print("APKTool stderr:", result.stderr)  

            manifest_path = decompiled_folder / 'AndroidManifest.xml'
            if not manifest_path.exists():
                print("Permision sucessful")
                return jsonify({'error': 'AndroidManifest.xml not found in APK'}), 500

            permissions = extract_permissions(manifest_path)
            print(permissions)

            # Clean up decompiled folder and uploaded file after processing
            apk_path.unlink()
            shutil.rmtree(decompiled_folder)

            return jsonify({'permissions': permissions}), 200

        except subprocess.CalledProcessError as e:
            print(f"Error during APK decompiling: {e.stderr}")  
            return jsonify({'error': 'Error during APK decompiling', 'details': e.stderr}), 500
    else:
        return jsonify({'error': 'Invalid file type'}), 400


def extract_permissions(manifest_path):
    """Extract permissions from the AndroidManifest.xml"""
    try:
        tree = ET.parse(manifest_path)
        root = tree.getroot()

        ns = {'android': 'http://schemas.android.com/apk/res/android'}
        permissions = []
        
        for permission in root.findall('.//uses-permission', ns):
            perm_name = permission.get('{http://schemas.android.com/apk/res/android}name')
            if perm_name:
                permissions.append(perm_name.replace('android.permission.', ''))

        return permissions
    except ET.ParseError as e:
        print(f"Error parsing AndroidManifest.xml: {e}")
        return {'error': f"Error parsing AndroidManifest.xml: {str(e)}"}
    except Exception as e:
        print(f"Error extracting permissions: {e}")  
        return {'error': f"Error extracting permissions: {str(e)}"}

@app.route("/toggle", methods=['POST'])
def toggle():
    try:
        # Parse the JSON data from the request
        data = request.get_json()
        
        # Extract permissions data and file path
        selected_permissions = data.get('selectedPermissions', [])
        apk_filename = data.get('apkFilename')
        if not apk_filename:
            return jsonify({"status": "error", "message": "APK filename not provided"}), 400

        # Define paths
        apk_path = UPLOAD_FOLDER / apk_filename
        decompiled_folder = UPLOAD_FOLDER / 'decompiled'
        manifest_path = decompiled_folder / 'AndroidManifest.xml'

        # Verify the existence of the manifest
        if not manifest_path.exists():
            return jsonify({'status': 'error', 'message': 'AndroidManifest.xml not found'}), 404

        # Update permissions in the manifest
        update_permissions(manifest_path, selected_permissions)

        # Recompile the APK
        recompiled_apk_path = UPLOAD_FOLDER / f'modified_{apk_filename}'
        result = subprocess.run(
            [APKTOOL_PATH, 'b', str(decompiled_folder), '-o', str(recompiled_apk_path), '-f'],
            check=True, capture_output=True, text=True
        )
        print("Recompiled APK:", result.stdout)

        # Provide the download link
        download_link = f'/download/{recompiled_apk_path.name}'

        return jsonify({
            "status": "success",
            "message": "Permissions updated successfully",
            "downloadLink": download_link
        }), 200

    except subprocess.CalledProcessError as e:
        print(f"Error during APK recompiling: {e.stderr}")
        return jsonify({"status": "error", "message": "Error during APK recompiling", "details": e.stderr}), 500
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"status": "error", "message": "Failed to process request"}), 400


@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """Serve the modified APK file for download."""
    file_path = UPLOAD_FOLDER / filename
    if file_path.exists():
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({'status': 'error', 'message': 'File not found'}), 404


def update_permissions(manifest_path, selected_permissions):
    """Update permissions in the AndroidManifest.xml file."""
    try:
        tree = ET.parse(manifest_path)
        root = tree.getroot()

        ns = {'android': 'http://schemas.android.com/apk/res/android'}
        # Remove existing permissions
        for permission in root.findall('.//uses-permission', ns):
            root.remove(permission)

        # Add updated permissions
        for perm_name in selected_permissions:
            permission_tag = ET.Element('uses-permission')
            permission_tag.set(f'{{{ns["android"]}}}name', f'android.permission.{perm_name}')
            root.append(permission_tag)

        # Write the updated manifest back to file
        tree.write(manifest_path, encoding='utf-8', xml_declaration=True)

    except Exception as e:
        print(f"Error updating permissions: {e}")
        raise

if __name__ == '__main__':
    app.run(debug=True, port=4500)  # Allows external access for debugging

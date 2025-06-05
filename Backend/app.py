from flask import Flask, request, jsonify, send_file
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET
from flask_cors import CORS
import shutil
import os
import json

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = Path('./uploads')
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

APKTOOL_PATH = '/usr/local/bin/apktool'
BUILD_TOOLS_PATH = '/home/rishaanth/Android/Sdk/build-tools/35.0.0'

KEYSTORE_PATH = '/home/rishaanth/Android/Sdk/build-tools/35.0.0/my-release-key.jks'
KEY_ALIAS = 'alias_name'
KEYSTORE_PASSWORD = 'test1234'
KEY_PASSWORD = 'test1234'

ZIPALIGN_PATH = '/home/rishaanth/Android/Sdk/build-tools/35.0.0/zipalign'

file_name = None

@app.route('/upload', methods=['POST'])
def upload_apk():
    global file_name
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
        file_name = file.filename
        file.save(apk_path)

        decompiled_folder = UPLOAD_FOLDER / 'decompiled'

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
                print(f"AndroidManifest.xml not found in {decompiled_folder}")
                return jsonify({'error': 'AndroidManifest.xml not found after decompilation'}), 500

            permissions = extract_permissions(manifest_path)
            print(f"Extracted permissions: {permissions}")

            return jsonify({'permissions': permissions}), 200

        except subprocess.CalledProcessError as e:
            print(f"Error during APK decompilation: {e.stderr}")
            return jsonify({'error': 'Error during APK decompilation', 'details': e.stderr}), 500

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
    
def extract_package_name(manifest_path):
    tree = ET.parse(manifest_path)
    root = tree.getroot()
    package_name = root.attrib.get('package', '')
    return package_name.replace('.', '/')

def add_screenshot_block():
    try:
     
        decompiled_folder = UPLOAD_FOLDER / 'decompiled'
        if not decompiled_folder.exists():
            return jsonify({'error': 'APK is not decompiled yet. Please upload first.'}), 400

       
        manifest_path = decompiled_folder / 'AndroidManifest.xml'
        manifest_package = extract_package_name(manifest_path) 
        main_activity_path = find_main_activity_smali(decompiled_folder, manifest_package)
        if not main_activity_path:
            return jsonify({'error': 'MainActivity.smali not found'}), 404

       
        if inject_screenshot_block_code(main_activity_path):
            
            modified_apk_path = UPLOAD_FOLDER / 'modified_apk.apk'
            result = subprocess.run(
                [APKTOOL_PATH, 'b', str(decompiled_folder), '-o', str(modified_apk_path)],
                check=True, capture_output=True, text=True
            )
            print("APKTool build stdout:", result.stdout)
            print("APKTool build stderr:", result.stderr)

            
            zipalign_apk(modified_apk_path, modified_apk_path)
            signed_apk_path = modified_apk_path.with_name(f'signed_{modified_apk_path.name}')
            sign_apk(modified_apk_path, signed_apk_path)

            return jsonify({
                'status': 'success',
                'message': 'Screenshot blocker added, APK recompiled, zipaligned, and signed successfully',
                'downloadLink': f'/download/{signed_apk_path.name}'
            }), 200

        else:
            return jsonify({'error': 'Failed to inject screenshot blocker code'}), 500

    except Exception as e:
        print(f"Error during the screenshot block process: {str(e)}")
        return jsonify({'error': str(e)}), 500

def adjust_smali_path_based_on_manifest(smali_folders, manifest_package):
    """
    Manually search through the smali folders (smali and smali_classes) and adjust the path
    based on the package name in the manifest.
    """
    try:
        for smali_folder in smali_folders:
           
            for root, dirs, files in os.walk(smali_folder):
                print(f"Checking directory: {root}")  
                if 'MainActivity.smali' in files:
                    main_activity_path = os.path.join(root, 'MainActivity.smali')
                    print(f"Found MainActivity.smali at: {main_activity_path}")

                  
                    adjusted_smali_path = main_activity_path
                    print(f"Adjusted path based on manifest and smali folder: {adjusted_smali_path}")

                    
                    if os.path.exists(adjusted_smali_path):
                        return adjusted_smali_path
                    else:
                        print(f"Adjusted path does not exist: {adjusted_smali_path}")
        
       
        print("MainActivity.smali not found in any smali folder")
        return None
    except Exception as e:
        print(f"Error adjusting smali path: {e}")
        return None

def find_main_activity_smali(decompiled_folder, manifest_package):
    """
    Manually look for MainActivity.smali in both smali and smali_classes subdirectories and adjust the path.
    """
    smali_dirs = [
        os.path.join(decompiled_folder, 'smali'),
        os.path.join(decompiled_folder, 'smali_classes2'),
        os.path.join(decompiled_folder, 'smali_classes3'),
        os.path.join(decompiled_folder, 'smali_classes4'),
        os.path.join(decompiled_folder, 'smali_classes5'),
        os.path.join(decompiled_folder, 'smali_classes6'),
        os.path.join(decompiled_folder, 'smali_classes7'),
        os.path.join(decompiled_folder, 'smali_classes8'),
        os.path.join(decompiled_folder, 'smali_classes9'),
        os.path.join(decompiled_folder, 'smali_classes10'),
        os.path.join(decompiled_folder, 'smali_classes11'),
        os.path.join(decompiled_folder, 'smali_classes12'),
        os.path.join(decompiled_folder, 'smali_classes13'),
        os.path.join(decompiled_folder, 'smali_classes14'),
        os.path.join(decompiled_folder, 'smali_classes15'),
        os.path.join(decompiled_folder, 'smali_classes16'),
        os.path.join(decompiled_folder, 'smali_classes17'),
        os.path.join(decompiled_folder, 'smali_classes18')
    ]

  
    if not any(os.path.exists(smali_dir) for smali_dir in smali_dirs):
        print("No smali or smali_classes directories found in decompiled APK folder")
        return None

    
    return adjust_smali_path_based_on_manifest(smali_dirs, manifest_package)

def inject_screenshot_block_code(file_path):
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()

        injection_code = """
    invoke-virtual {p0}, Landroid/app/Activity;->getWindow()Landroid/view/Window;
    move-result-object v0
    const/16 v1, 0x2000
    invoke-virtual {v0, v1, v1}, Landroid/view/Window;->setFlags(II)V
"""

        for i, line in enumerate(lines):
            if '->onCreate' in line:
                insert_index = i + 1
                while insert_index < len(lines) and '}' not in lines[insert_index]:
                    insert_index += 1
                lines.insert(insert_index, injection_code)
                break

        with open(file_path, 'w') as file:
            file.writelines(lines)

        print("Screenshot blocker code injected successfully")
        return True
    except Exception as e:
        print(f"Error injecting screenshot blocker code: {e}")
        return False


def zipalign_apk(input_apk, output_apk):
    subprocess.run([ZIPALIGN_PATH, "-f", "4", str(input_apk), str(output_apk)])


def sign_apk(input_apk, signed_apk):
    subprocess.run([
        "jarsigner", "-verbose", "-keystore", KEYSTORE_PATH, 
        "-alias", KEY_ALIAS, "-storepass", KEY_PASSWORD, 
        "-keypass", KEY_PASSWORD, str(input_apk), KEY_ALIAS
    ])

@app.route("/toggle", methods=['POST'])
def toggle():
    try:
        data = request.get_json()
        selected_permissions = data.get('selectedPermissions', [])
        toggle_status = data.get('toggleStatus', False)  # Check toggle status
        print(f"Received selected permissions: {selected_permissions}")
        print(f"Toggle status: {toggle_status}")

        if toggle_status:
            json_data = {
                "fileName": file_name,  
                "selectedOptions": selected_permissions
            }
            json_file_path = f"{UPLOAD_FOLDER}/toggle_data.json"
            with open(json_file_path, "w") as json_file:
                json.dump(json_data, json_file)
            print(f"Data saved to {json_file_path}")
            return jsonify({"status": "success", "message": "Data saved successfully"}), 200
        
        if "Disable Screenshot Permissions" in selected_permissions:
            print("Disabling screenshot functionality...")
            response = add_screenshot_block()
            
            
            if isinstance(response, tuple):  
                return jsonify({'error': response[0]}), response[1]  
            
            return response

        permission_mapping = {
            'Disable External Storage Access': 'android.permission.MANAGE_EXTERNAL_STORAGE',
            'Disable Camera Permissions': 'android.permission.CAMERA',
            'Disable Bluetooth Permissions': 'android.permission.BLUETOOTH',
            'Disable Location Permissions': 'android.permission.ACCESS_FINE_LOCATION',
            'Disable Network Permissions': 'android.permission.ACCESS_NETWORK_STATE',
            'Disable SMS Permissions': 'android.permission.SEND_SMS',
            'Disable Overlay Permissions': 'android.permission.SYSTEM_ALERT_WINDOW',
            'Disable Accessibility Features': 'android.permission.BIND_ACCESSIBILITY_SERVICE',
            'Disable Microphone Permissions': 'android.permission.RECORD_AUDIO',
        }

        android_permissions = [permission_mapping.get(perm) for perm in selected_permissions if permission_mapping.get(perm)]

        if not android_permissions:
            return jsonify({'error': 'No valid permissions selected or permissions are not mapped'}), 400

        decompiled_folder = UPLOAD_FOLDER / 'decompiled'
        manifest_path = decompiled_folder / 'AndroidManifest.xml'
        modified_apk_path = UPLOAD_FOLDER / 'modified_apk.apk'

        if add_permissions_to_manifest(manifest_path, android_permissions):
            print("Permissions removed from the manifest successfully")
        else:
            return jsonify({'error': 'Failed to add permissions to AndroidManifest.xml'}), 500

        try:
            result = subprocess.run(
                [APKTOOL_PATH, 'b', str(decompiled_folder), '-o', str(modified_apk_path)],
                check=True, capture_output=True, text=True
            )
            print("APKTool build stdout:", result.stdout)
            print("APKTool build stderr:", result.stderr)
        except subprocess.CalledProcessError as e:
            return jsonify({'error': 'Error during APK rebuilding', 'details': e.stderr}), 500

        zipalign_apk(modified_apk_path, modified_apk_path)

        signed_apk_path = modified_apk_path.with_name(f'signed_{modified_apk_path.name}')
        sign_apk(modified_apk_path, signed_apk_path)

        return jsonify({
            'status': 'success',
            'message': 'Permissions added, APK rebuilt, zipaligned, and signed successfully',
            'downloadLink': f'/download/{signed_apk_path.name}'
        }), 200

    except Exception as e:
        print(f"Error during toggle processing: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to process request", "details": str(e)}), 500


def add_permissions_to_manifest(manifest_path, permissions):
    """Remove permissions from the AndroidManifest.xml"""
    try:
        android_ns = "http://schemas.android.com/apk/res/android"
        ET.register_namespace('android', android_ns)

        tree = ET.parse(manifest_path)
        root = tree.getroot()

        
        ns = {'android': android_ns}

       
        for perm in permissions:
            
            permission_element = root.find(f".//uses-permission[@{{{android_ns}}}name='{perm}']", ns)
            
            if permission_element is not None:
               
                root.remove(permission_element)
                print(f"Removed permission: {perm}")
            else:
                print(f"Permission not found: {perm}")

       
        tree.write(manifest_path, encoding='utf-8', xml_declaration=True)
        return True

    except Exception as e:
        print(f"Error updating AndroidManifest.xml: {e}")
        return False


def zipalign_apk(input_apk, output_apk):
    """Run zipalign to align the APK."""
    zipalign_path = os.path.join(BUILD_TOOLS_PATH, 'zipalign')

    
    aligned_apk = output_apk.parent / ('aligned_' + output_apk.name)

    cmd = [zipalign_path, '-v', '4', str(input_apk), str(aligned_apk)]
    try:
        subprocess.run(cmd, check=True)
        print(f"APK successfully zipaligned to {aligned_apk}")

        
        aligned_apk.rename(output_apk)
        print(f"Aligned APK moved to {output_apk}")

    except subprocess.CalledProcessError as e:
        print(f"Error during zipalign: {e}")
        raise e


def sign_apk(input_apk, output_apk):
    """Sign the APK using apksigner."""
    apksigner_path = os.path.join(BUILD_TOOLS_PATH, 'apksigner')

    
    signed_apk = output_apk.parent / ('signed_' + output_apk.name)

    cmd = [
        apksigner_path, 'sign', 
        '--ks', KEYSTORE_PATH, 
        '--ks-key-alias', KEY_ALIAS, 
        '--ks-pass', f'pass:{KEYSTORE_PASSWORD}', 
        '--key-pass', f'pass:{KEY_PASSWORD}', 
        '--out', str(signed_apk), 
        str(input_apk)
    ]
    try:
        subprocess.run(cmd, check=True)
        print(f"APK successfully signed: {signed_apk}")

        
        signed_apk.rename(output_apk)
        print(f"Signed APK moved to {output_apk}")

    except subprocess.CalledProcessError as e:
        print(f"Error during signing: {e}")
        raise e
    

@app.route('/download', methods=['GET'])
def download_signed_apk():
    """Serve the signed APK for download"""
    try:
        
        file_path = Path('/home/rishaanth/Desktop/projects/sih_smalli/SIH---Phase-2-main (1)/SIH---Phase-2-main/Backend/uploads/signed_modified_apk.apk')
        if not file_path.exists():
            print(f"File not found: {file_path}")
            return jsonify({'error': 'File not found'}), 404
        
        print(f"Serving signed APK for download: {file_path}")
        return send_file(
            file_path,
            as_attachment=True,
            download_name='signed_apk.apk',
            mimetype='application/vnd.android.package-archive'
        )
    except Exception as e:
        print(f"Error during file download: {e}")
        return jsonify({'error': f"Failed to download file: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=4500)

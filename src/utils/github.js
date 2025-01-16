// 환경 변수에서 API 키 읽기
const API_KEY = "AIzaSyB6-Jsbz2peprO2atIS8VX1WX_FQt109xI";
const FOLDER_ID = "1er4UE7wClo6Jk1YzfVOtog5ZVtAtG5cl";

// Google Drive 폴더 파일 리스트 가져오기
export async function listGoogleDriveFiles() {
    const downloadurl = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}`
    const response = await fetch(
        downloadurl , {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }
    );
    if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
    }
    const data = await response.json();
    return data.files; // 파일 리스트 반환
}

// Google Drive 파일 내용 가져오기
export async function fetchGoogleDriveContent(fileId) {
    const fetchurl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`
    const response = await fetch(
        fetchurl, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return await response.text(); // 파일 내용 반환
}
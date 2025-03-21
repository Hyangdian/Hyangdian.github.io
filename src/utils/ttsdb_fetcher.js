const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
const RANGE = `!A:E`; // 필요한 범위로 수정

// Google Drive 폴더 파일 리스트 가져오기
export async function listGoogleDriveFiles() {
    const downloadurl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await fetch(
        downloadurl, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        }
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
    }
    const data = await response.json();
    
    // 데이터 처리
    const headers = data.values[0]; // 0열의 값 (헤더)
    const rows = data.values.slice(1); // 1열부터의 값 (데이터)

    const processedData = await Promise.all(rows.map(async row => {
        const fileData = headers.reduce((acc, header, index) => {
            acc[header] = row[index]; // 헤더를 키로 사용하여 각 행의 값을 객체로 변환
            return acc;
        }, {});

        // 썸네일 Blob 가져오기
        if (fileData.thumbnail) {
            const imageBlob = await fetchGoogleDriveImage(fileData.thumbnail);
            fileData.thumbnail = URL.createObjectURL(imageBlob); // Blob URL 생성
        }

        return fileData;
    }));
    return processedData; // 처리된 데이터 반환
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

// Google Drive 이미지 가져오기
export async function fetchGoogleDriveImage(fileId) {
    const fetchurl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
    const response = await fetch(fetchurl, {
        method: 'GET',
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return await response.blob(); // 파일 내용을 Blob 형태로 반환
}
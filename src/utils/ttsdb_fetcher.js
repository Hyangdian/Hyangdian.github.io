import Papa from 'papaparse';

// 파일 리스트 가져오기
export async function listFiles() {
    try {
        const response = await fetch('/database/boardgame_list.csv');
        if (!response.ok) {
            throw new Error(`CSV 파일을 가져오는데 실패했습니다: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        const results = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true
        });
        
        return results.data;
        
    } catch (error) {
        console.error("CSV 파일 로딩 실패:", error);
        throw error;
    }
}
// 로컬 마크다운 파일 내용 가져오기
export async function fetchLocalMarkdownContent(fileName) {
    try {
        const response = await fetch(`/database/markdowns/${fileName}`);
        if (!response.ok) {
            throw new Error(`마크다운 파일을 가져오는데 실패했습니다: ${response.statusText}`);
        }
        return await response.text(); // 파일 내용 반환
    } catch (error) {
        console.error("마크다운 파일 로딩 실패:", error);
        throw error;
    }
}
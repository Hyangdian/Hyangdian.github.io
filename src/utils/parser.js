export function parseMetadata(responseContent) {
    // JSON 파싱
    const jsonContent = JSON.parse(responseContent);
    
    // base64로 인코딩된 content를 디코딩
    const decodedContent = decodeBase64(jsonContent.content);

    // 메타데이터 초기화
    let metadata = {
        title: "", // 기본값
        tags: [],  // 기본값
        thumbnail: "", // 썸네일 기본값
        content: decodedContent // 디코딩된 Markdown 내용
    };

    // 메타데이터 추출
    const metadataRegex = /^---\n([\s\S]*?)\n---/; // YAML 메타데이터를 찾기 위한 정규 표현식
    const match = decodedContent.match(metadataRegex);

    if (match) {
        const metadataStr = match[1];
        const lines = metadataStr.split('\n');

        lines.forEach(line => {
            const [key, ...values] = line.split(':');
            if (key.trim() === 'title') {
                metadata.title = values.join(':').trim().replace(/"/g, ''); // 제목 추출
            } else if (key.trim() === 'tags') {
                metadata.tags = JSON.parse(values.join(':').trim()); // 태그 추출
            } else if (key.trim() === 'thumbnail') {
                metadata.thumbnail = values.join(':').trim().replace(/"/g, ''); // 썸네일 경로 추출 및 따옴표 제거
            }
        });

        // 메타데이터가 포함된 부분을 content에서 제거
        metadata.content = decodedContent.replace(metadataRegex, '').trim();
    }

    return metadata;
}

// base64 디코딩 함수
const decodeBase64 = (base64) => {
    return decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
};
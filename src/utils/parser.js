export function parseMetadata(responseContent) {
    console.log('Parsing Response Content:', responseContent);

    // 기본값 설정
    let metadata = {
        title: "",
        tags: [],
        thumbnail: "",
        players: "",
        content: responseContent, // 원본 Markdown 내용
    };

    // YAML 메타데이터 추출을 위한 정규 표현식
    const metadataRegex = /^---\s*([\s\S]*?)\s*---/;
    const match = responseContent.match(metadataRegex);

    if (match) {
        const metadataStr = match[1];
        const lines = metadataStr.split('\n');

        lines.forEach(line => {
            const [key, ...values] = line.split(':');
            if (!key || !values.length) return; // 잘못된 줄 무시

            const keyTrimmed = key.trim();
            const value = values.join(':').trim().replace(/(^"|"$)/g, ''); // 값의 앞뒤 따옴표 제거

            if (keyTrimmed === 'title') {
                metadata.title = value;
            } else if (keyTrimmed === 'tags') {
                // tags는 배열 형태로 파싱
                metadata.tags = value
                    .replace(/^\[/, '') // 앞 대괄호 제거
                    .replace(/\]$/, '') // 뒤 대괄호 제거
                    .split(',')         // 콤마 기준 분리
                    .map(tag => tag.trim().replace(/(^"|"$)/g, '')); // 각 태그의 따옴표 제거
            } else if (keyTrimmed === 'thumbnail') {
                metadata.thumbnail = value;
            } else if (keyTrimmed === 'players') {
                metadata.players = value;
            }
        });

        // 메타데이터 제거 후 Markdown 내용만 남김
        metadata.content = responseContent.replace(metadataRegex, '').trim();
    }

    console.log('Parsed Metadata:', metadata);
    return metadata;
}

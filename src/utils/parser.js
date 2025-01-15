export function parseMetadata(content) {
    const metadataRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(metadataRegex);
    
    if (!match) return { title: "", tags: [], content };
    
    const metadataStr = match[1];
    const metadata = {};
    
    metadataStr.split('\n').forEach(line => {
        const [key, ...values] = line.split(':');
        if (key === 'tags') {
            metadata[key] = JSON.parse(values.join(':').trim());
        } else {
            metadata[key] = values.join(':').trim().replace(/"/g, '');
        }
    });
    
    return {
        ...metadata,
        content: content.replace(metadataRegex, '').trim()
    };
} 
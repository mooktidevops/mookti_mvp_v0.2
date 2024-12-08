// basic content chunk

interface ContentChunk {
    metadata: {
        module_id: number;
        chunk_id: number;
        description: string;
        type: string; // should enumerate all possible types
        next: 'getnext' | 'checkin'
    }
    content: string;
    // enumerate methods here
    // example: 'getnext' -> get the next chunk
    // example: 'checkin' -> checkin with the user, offering a choice of 'moveon' or 'tellmemore'
    // example: constructor methods, which include automatic generation of numeric ids
}
const searchInAgent = (data, searchTerm) => {
    if (!Array.isArray(data)) return [];

    if (!searchTerm) return data;

    const lowerCasedTerm = String(searchTerm).toLowerCase();
    return data.filter(
        (item) =>
            item.description.toLowerCase().includes(lowerCasedTerm) ||
            item.fieldTag.toLowerCase().includes(lowerCasedTerm) ||
            item.notes.toLowerCase().includes(lowerCasedTerm)
    );
};


export default searchInAgent;


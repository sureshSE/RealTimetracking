const searchInPlaceOfInterest = (data, searchTerm) => {
    if (!Array.isArray(data)) return [];

    if (!searchTerm) return data;

    const lowerCasedTerm = String(searchTerm).toLowerCase();
    return data.filter(
        (item) =>
            item.title.toLowerCase().includes(lowerCasedTerm) ||
            item.notes.toLowerCase().includes(lowerCasedTerm)
    );
};


export default searchInPlaceOfInterest;


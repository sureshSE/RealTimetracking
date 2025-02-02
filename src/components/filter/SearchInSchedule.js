
const searchInSchedule = (data, searchTerm) => {
    if (!Array.isArray(data)) return [];

    if (!searchTerm) return data;

    const lowerCasedTerm = String(searchTerm).toLowerCase();
    return data.filter(
        (item) =>
            item.taskStatus.toLowerCase().includes(lowerCasedTerm) ||
            item.description.toLowerCase().includes(lowerCasedTerm) ||
            item.fieldTag.toLowerCase().includes(lowerCasedTerm)


    );
};


export default searchInSchedule;


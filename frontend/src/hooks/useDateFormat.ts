export const formatEventDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('fr', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};
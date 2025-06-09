/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 *
 * @param {...Object} coords - An array of objects representing geographical coordinates. Each object should have 'lat' and 'lng' properties.
 * @param {number} coords[].lat - The latitude of the coordinate.
 * @param {number} coords[].lng - The longitude of the coordinate.
 *
 * @returns {number} The distance between the two coordinates in kilometers.
 */
export function getDistance(...coords) {
    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(coords[1].lat - coords[0].lat);  // deg2rad below
    var dLon = deg2rad(coords[1].lng - coords[0].lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(coords[0].lat)) * Math.cos(deg2rad(coords[1].lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}
/**
 * Retrieves the geographical coordinates (latitude and longitude) for a given address using the Kakao Maps API.
 *
 * @param {string} address - The address for which to retrieve coordinates.
 * @returns {Promise<{lat: number, lng: number}>} A promise that resolves to an object containing the latitude and longitude of the address.
 * @throws {Error} If the Kakao Maps API is not loaded or if the address cannot be resolved.
 */
export async function getCoordinates(address) {
    return await new Promise((resolve, reject) => {
        if (!userAddress || !window.kakao || !window.kakao.maps) {
            reject(new Error("Kakao Maps API is not loaded."));
        }

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result, userStatus) => {
            if (userStatus === window.kakao.maps.services.Status.OK) {
                const coord = {
                    lat: result[0].y,
                    lng: result[0].x
                };
                resolve(coord);
            } else {
                function placesSearchCB(data, status, pagination) {
                    if (status === kakao.maps.services.Status.OK) {
                        const coord = {
                            lat: data[0].y,
                            lng: data[0].x
                        };
                        resolve(coord);
                    }
                }

                // 장소 검색 객체를 생성합니다
                var ps = new kakao.maps.services.Places();

                // 키워드로 장소를 검색합니다
                ps.keywordSearch(address, placesSearchCB);
            }
        });
    });
}
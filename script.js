const map = L.map("map").setView(
    [37.955482, 139.338409],
    15
);

// OpenStreetMap
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap contributors"
    }
).addTo(map);

const goals = [
    {
        name: "ウオロク",
        lat: 37.956193588377594,
        lng: 139.3357125780292,
    },
    {
        name: "新発田城跡",
        lat: 37.954824724542696,
        lng: 139.326001834219947,
    },
    {
        name: "清水園",
        lat: 37.943791,
        lng: 139.328785,
    },
    {
        name: "蔵春閣",
        lat: 37.94389807273562,
        lng: 139.3317142467578,
    },
    {
        name: "東公園のSL",
        lat: 37.94367248807764,
        lng: 139.3323475293261,
    },
    {
        name: "諏訪神社",
        lat: 37.944214,
        lng: 139.332004,
    },
    {
        name: "新発田市役所",
        lat: 37.947839,
        lng: 139.327160,
    },
    {
        name: "王紋酒造",
        lat: 37.94436989072327,
        lng: 139.33066511399528,
    },
    {
        name: "五十公野公園",
        lat: 37.939869,
        lng: 139.356680,
    },
    {
        name: "カルチャーセンター",
        lat: 37.950246,
        lng: 139.338618,
    },
    {
        name: "新発田駅",
        lat: 37.94413,
        lng: 139.33510,
    },
    {
        name: "あやめの湯",
        lat: 37.953545,
        lng: 139.3549475,
    },
    {
        name: "イクネスしばた",
        lat: 37.944357,
        lng: 139.333388,
    },
    {
        name: "市民文化会館",
        lat: 37.951722,
        lng: 139.326564,
    },
    {
        name: "新発田歴史図書館",
        lat: 37.951279909157336,
        lng: 139.32774756292181,
    },
    {
        name: "旧新発田市役所",
        lat: 37.950883,
        lng: 139.327898,
    },
    {
        name: "新潟職能短大",
        lat: 37.956067,
        lng: 139.337938,
    },
    {
        name: "菊水",
        lat: 37.960376479226,
        lng: 139.35429135822383
    }
];

// 現在地マーカー
let currentMarker = null;
// 現在表示されているルート
let routeLine = null;
// 現在地の監視ID
let watchId = null;
// 現在選択している目的地
let currentGoal = null;

goals.forEach(goal => {

    const marker = L.marker([
        goal.lat,
        goal.lng
    ]);
    marker.addTo(map);
    marker.bindPopup(
        `<b>${goal.name}</b><br>`
    );

    // 目的地をクリック
    marker.on("click", () => {
        // 選択中の目的地を変更
        currentGoal = goal;
        // 古いルートを削除
        removeRoute();
        // 新しい目的地へのナビを開始
        startNavigation(goal);
    });
});

function removeRoute() {
    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }
}

function startNavigation(goal) {

    // GPSが使えるか確認
    if (!navigator.geolocation) {
        alert(
            "この端末では現在地を取得できません。"
        );
        return;
    }

    if (watchId === null) {
        watchId =
            navigator.geolocation.watchPosition(
                function (position) {
                    const myLat =
                        position.coords.latitude;
                    const myLng =
                        position.coords.longitude;

                    // 現在地ピンを更新
                    updateCurrentLocation(
                        myLat,
                        myLng
                    );

                    // 目的地が選択されていれば
                    if (currentGoal) {
                        // ルートがまだない場合
                        if (!routeLine) {
                            showRoute(
                                myLat,
                                myLng,
                                currentGoal
                            );
                        }
                    }
                },
                function (error) {
                    console.error(error);
                    alert(
                        "現在地を取得できませんでした。"
                    );
                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
    }
}

function updateCurrentLocation(
    lat,
    lng
) {

    // 初回
    if (!currentMarker) {
        currentMarker =
            L.marker([
                lat,
                lng
            ])
            .addTo(map)
            .bindPopup("現在地");

    }

    // 2回目以降
    else {

        currentMarker.setLatLng([
            lat,
            lng
        ]);
    }
}

async function showRoute(
    myLat,
    myLng,
    goal
) {

    removeRoute();

    const url =
        `https://router.project-osrm.org/route/v1/walking/` +
        `${myLng},${myLat};` +
        `${goal.lng},${goal.lat}` +
        `?overview=full&geometries=geojson`;

    try {
        const response =
            await fetch(url);
        const data =
            await response.json();

        if (
            !data.routes ||
            data.routes.length === 0
        ) {
            alert(
                "ルートが見つかりません"
            );

            return;
        }

        const route =
            data.routes[0];

        const latlngs =
            route.geometry.coordinates.map(
                point => [
                    point[1],
                    point[0]
                ]
            );

        routeLine =
            L.polyline(
                latlngs,
                {
                    color: "blue",
                    weight: 6
                }
            ).addTo(map);

        map.fitBounds(
            routeLine.getBounds()
        );

        const distance =
            (
                route.distance / 1000
            ).toFixed(2);
        
        const minutes =
            Math.round(
                route.duration / 60
            );

        document.getElementById(
            "info"
        ).innerHTML =

            `
            <b>${goal.name}</b><br>
            距離：${distance} km<br>
            所要時間：約 ${minutes} 分
            `;
    }

    catch (error) {
        console.error(error);
        alert(
            "ルート検索に失敗しました。"
        );
    }
}

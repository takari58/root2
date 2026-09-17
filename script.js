const map = L.map("map").setView([37.955482, 139.338409], 15);

// OpenStreetMap
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap contributors"
    }
).addTo(map);


// ==============================
// 目的地データ
// ==============================

const goals = [
    {
        name: "新発田城跡",
        lat: 37.954824724543,
        lng: 139.326001834219,
    },
    {
        name: "清水園",
        lat: 37.943791,
        lng: 139.328785,
    },
    {
        name: "蔵春閣",
        lat: 37.9438980727356,
        lng: 139.331714246757,
    },
    {
        name: "東公園のSL",
        lat: 37.9436724880776,
        lng: 139.332347529326,
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
        lng: 139.35429135822383,
    },
    {
        name: "ボン・タケダ",
        lat: 37.94039,
        lng: 139.336,
    },
    {
        name: "藤倉メンチカツや",
        lat: 37.93682,
        lng: 139.34488,
    },
    {
        name: "いっぷく",
        lat: 37.9443765405075,
        lng: 139.340743962673,
    },
    {
        name: "文化洋食ino",
        lat: 37.9623641139771,
        lng: 139.334281893588,
    },
    {
        name: "やすけカレー",
        lat: 37.9377482726362,
        lng: 139.336158926512,
    },
    {
        name: "レストラン蒲城",
        lat: 37.9504968436357,
        lng: 139.339474708348,
    },
    {
        name: "コーヒーマリーナ 煉瓦屋",
        lat: 37.9491031178618,
        lng: 139.324669426051,
    },
    {
        name: "パーラーやお屋",
        lat: 37.958499803976,
        lng: 139.342528211321,
    }
];


// ==============================
// 変数
// ==============================

let currentMarker = null;
let routeLine = null;

// 現在地監視用
let watchId = null;

// 選択中の目的地
let selectedGoal = null;

// 現在地
let currentPosition = null;


// ==============================
// 目的地ピン作成
// ==============================

goals.forEach(goal => {

    const marker = L.marker([goal.lat, goal.lng]);

    marker.addTo(map);

    marker.bindPopup(
        `<b>${goal.name}</b><br>
        タップするとルートを表示します。`
    );

    marker.on("click", () => {

        selectedGoal = goal;

        startNavigation(goal);

    });

});


// ==============================
// ナビ開始
// ==============================

function startNavigation(goal) {

    selectedGoal = goal;

    // すでに現在地監視中なら再利用
    if (watchId !== null) {

        // 現在地が取得済みなら
        // すぐにルートを表示
        if (currentPosition) {

            showRoute(
                currentPosition.lat,
                currentPosition.lng,
                goal
            );

        }

        return;
    }


    // 現在地を継続的に監視
    watchId = navigator.geolocation.watchPosition(

        function (position) {

            const myLat =
                position.coords.latitude;

            const myLng =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            // 現在地を保存
            currentPosition = {
                lat: myLat,
                lng: myLng
            };


            // ==========================
            // 現在地ピンを移動
            // ==========================

            updateCurrentMarker(
                myLat,
                myLng,
                accuracy
            );


            // ==========================
            // 目的地が選択されていれば
            // ルートを更新
            // ==========================

            if (selectedGoal) {

                showRoute(
                    myLat,
                    myLng,
                    selectedGoal
                );

            }

        },

        function (error) {

            console.error(
                "位置情報エラー:",
                error
            );
            if (error.code === 1) {
                alert(
                    "位置情報の利用が許可されていません。"
                );
            } else if (error.code === 2) {
                alert(
                    "現在地を取得できませんでした。"
                );
            } else if (error.code === 3) {
                alert(
                    "現在地の取得がタイムアウトしました。"
                );
            }
        },
        {
            enableHighAccuracy: true,
            // できるだけ新しい位置情報を取得
            maximumAge: 0,
            // タイムアウト
            timeout: 10000
        }
    );
}

function updateCurrentMarker(
    lat,
    lng,
    accuracy
) {
    // まだ現在地ピンがない場合
    if (!currentMarker) {
        currentMarker = L.marker(
            [lat, lng]
        ).addTo(map);
        currentMarker.bindPopup(
            "現在地"
        );
    }

    // 現在地ピンを移動
    else {
        currentMarker.setLatLng(
            [lat, lng]
        );
    }
}

async function showRoute(
    myLat,
    myLng,
    goal
) {

    const url =
        `https://router.project-osrm.org/route/v1/walking/` +
        `${myLng},${myLat};${goal.lng},${goal.lat}` +
        `?overview=full&geometries=geojson`;

    try {
        const response =
            await fetch(url);
        const data =
            await response.json();
        // ルートが存在しない
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

        if (routeLine) {

            map.removeLayer(
                routeLine
            );

        }

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

        const distance =
            (
                route.distance / 1000
            ).toFixed(2);

        const distanceMeter =
            route.distance;

        const minutes =
            Math.round(
                distanceMeter / 66.67
            );

        document
            .getElementById("info")
            .innerHTML = `
                <b>${goal.name}</b><br>
                距離：${distance} km<br>
                所要時間：約 ${minutes} 分
            `;

    } catch (error) {
        console.error(error);
        alert(
            "ルート検索に失敗しました。"
        );
    }
}

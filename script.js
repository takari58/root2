const map = L.map("map").setView(
    [37.955482, 139.338409],
    15
);


// ========================================
// OpenStreetMap
// ========================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap contributors"
    }
).addTo(map);


// ========================================
// 目的地
// ========================================

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


// ========================================
// 変数
// ========================================

// 現在地ピン
let currentMarker = null;

// GPS監視
let watchId = null;

// 選択中の目的地
let selectedGoal = null;

// 現在地
let currentPosition = null;

// ルート線
let routeLine = null;

// 前回ルート検索した位置
let lastRouteLat = null;
let lastRouteLng = null;

// ルート検索中か
let routeSearching = false;


// ========================================
// 現在地用アイコン
// ========================================

const currentLocationIcon = L.icon({

    // 画像ファイル
    iconUrl: "./current-pin.png",

    // 表示サイズ
    iconSize: [45, 45],

    // アイコンの中心を現在地に合わせる
    iconAnchor: [22.5, 22.5],

    // ポップアップ位置
    popupAnchor: [0, -25]
});


// ========================================
// 目的地ピンを作成
// ========================================

goals.forEach(goal => {

    const marker = L.marker([
        goal.lat,
        goal.lng
    ]);

    marker.addTo(map);


    marker.bindPopup(
        `<b>${goal.name}</b><br>
        ここまで案内する`
    );


    // ====================================
    // 目的地クリック
    // ====================================

    marker.on("click", function() {

        selectedGoal = goal;


        // 現在地がすでに取得できている場合
        if (currentPosition !== null) {

            showRoute(
                currentPosition.lat,
                currentPosition.lng,
                selectedGoal
            );

        }

        else {

            document.getElementById("info").innerHTML =
                `
                <b>${goal.name}</b><br>
                現在地を取得しています...
                `;

        }

    });

});


// ========================================
// 現在地の監視を開始
// ========================================

function startLocationTracking() {

    if (!navigator.geolocation) {

        document.getElementById("info").innerHTML =
            "この端末では位置情報を利用できません。";

        return;
    }


    // すでに監視している場合
    if (watchId !== null) {
        return;
    }


    watchId =
        navigator.geolocation.watchPosition(

            // ====================================
            // GPS成功
            // ====================================

            function(position) {

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;


                console.log(
                    "現在地:",
                    lat,
                    lng
                );


                // 現在地を保存
                currentPosition = {
                    lat: lat,
                    lng: lng
                };


                // ====================================
                // 現在地ピン
                // ====================================

                if (currentMarker === null) {

                    // 初回だけピンを作成
                    currentMarker =
                        L.marker(
                            [lat, lng],
                            {
                                icon: currentLocationIcon,

                                // 目的地より前に表示
                                zIndexOffset: 1000
                            }
                        )
                        .addTo(map);


                    currentMarker.bindPopup(
                        "現在地"
                    );

                }

                else {

                    // 2回目以降は
                    // ピンだけ移動
                    currentMarker.setLatLng([
                        lat,
                        lng
                    ]);

                }


                // ====================================
                // 目的地が選択されている場合
                // ====================================

                if (selectedGoal !== null) {

                    // 前回からある程度移動したら
                    // ルートを更新
                    updateRouteIfNeeded(
                        lat,
                        lng,
                        selectedGoal
                    );

                }

            },


            // ====================================
            // GPSエラー
            // ====================================

            function(error) {

                console.error(
                    "位置情報エラー:",
                    error
                );


                if (error.code === 1) {

                    document.getElementById("info").innerHTML =
                        "位置情報の利用を許可してください。";

                }

                else if (error.code === 2) {

                    document.getElementById("info").innerHTML =
                        "現在地を取得できませんでした。";

                }

                else if (error.code === 3) {

                    document.getElementById("info").innerHTML =
                        "現在地の取得がタイムアウトしました。";

                }

                else {

                    document.getElementById("info").innerHTML =
                        "現在地を取得できませんでした。";

                }

            },


            // ====================================
            // GPS設定
            // ====================================

            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            }

        );

}


// ========================================
// 必要なときだけルートを更新
// ========================================

function updateRouteIfNeeded(
    lat,
    lng,
    goal
) {

    // 前回の検索位置がない場合
    if (
        lastRouteLat === null ||
        lastRouteLng === null
    ) {

        showRoute(
            lat,
            lng,
            goal
        );

        return;
    }


    // 前回の位置からの距離
    const distance =
        getDistance(
            lat,
            lng,
            lastRouteLat,
            lastRouteLng
        );


    // 20m以上移動したらルート更新
    if (distance >= 20) {

        showRoute(
            lat,
            lng,
            goal
        );

    }

}


// ========================================
// 2地点間の距離を計算
// ========================================

function getDistance(
    lat1,
    lng1,
    lat2,
    lng2
) {

    const R = 6371000;

    const rad =
        Math.PI / 180;

    const dLat =
        (lat2 - lat1) * rad;

    const dLng =
        (lng2 - lng1) * rad;


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * rad) *
        Math.cos(lat2 * rad) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;

}


// ========================================
// ルート表示
// ========================================

async function showRoute(
    myLat,
    myLng,
    goal
) {

    // ルート検索中なら重複しない
    if (routeSearching) {
        return;
    }


    routeSearching = true;


    // 今回検索した位置を保存
    lastRouteLat = myLat;
    lastRouteLng = myLng;


    // OSRM
    const url =
        `https://router.project-osrm.org/route/v1/walking/` +
        `${myLng},${myLat};` +
        `${goal.lng},${goal.lat}` +
        `?overview=full&geometries=geojson`;


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "ルート検索に失敗しました"
            );

        }


        const data =
            await response.json();


        // ルートなし
        if (
            !data.routes ||
            data.routes.length === 0
        ) {

            document.getElementById("info").innerHTML =
                `
                <b>${goal.name}</b><br>
                ルートが見つかりません。
                `;

            return;
        }


        const route =
            data.routes[0];


        // ====================================
        // 古いルートを削除
        // ====================================

        if (routeLine !== null) {

            map.removeLayer(
                routeLine
            );

        }


        // ====================================
        // GeoJSON → Leaflet
        // ====================================

        const latlngs =
            route.geometry.coordinates.map(
                point => [
                    point[1],
                    point[0]
                ]
            );


        // ====================================
        // ルート線
        // ====================================

        routeLine =
            L.polyline(
                latlngs,
                {
                    color: "blue",
                    weight: 6,
                    opacity: 0.8
                }
            ).addTo(map);


        // ====================================
        // 距離
        // ====================================

        const distance =
            (
                route.distance / 1000
            ).toFixed(2);


        // ====================================
        // 徒歩時間
        // ====================================

        const distanceMeter =
            route.distance;


        // 時速4km
        const minutes =
            Math.round(
                distanceMeter / 66.67
            );


        // ====================================
        // 情報表示
        // ====================================

        document.getElementById("info").innerHTML =
            `
            <b>${goal.name}</b><br>
            距離：${distance} km<br>
            所要時間：約 ${minutes} 分
            `;


    }

    catch (error) {

        console.error(
            "ルート検索エラー:",
            error
        );


        document.getElementById("info").innerHTML =
            `
            <b>${goal.name}</b><br>
            ルート検索に失敗しました。
            `;

    }

    finally {

        routeSearching = false;

    }

}


// ========================================
// GPS監視開始
// ========================================

startLocationTracking();

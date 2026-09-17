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

let currentMarker = null;
let watchId = null;

const currentLocationIcon = L.icon({

    // 現在地の画像
    iconUrl: "current-pin.png",

    // 画像サイズ
    iconSize: [45, 45],

    // 画像の中心を現在地に合わせる
    iconAnchor: [22.5, 22.5],

    // ポップアップの位置
    popupAnchor: [0, -22.5]
});


// ========================================
// 目的地のピンを作成
// ========================================

goals.forEach(goal => {

    const marker = L.marker([
        goal.lat,
        goal.lng
    ]);

    marker.addTo(map);


    // ポップアップ
    marker.bindPopup(
        `<b>${goal.name}</b>`
    );

});


// ========================================
// 現在地の監視
// ========================================

function startLocationTracking() {

    // GPSが使えるか確認
    if (!navigator.geolocation) {

        document.getElementById("info").innerHTML =
            "この端末では位置情報を利用できません。";

        return;
    }


    // すでに監視している場合
    if (watchId !== null) {

        return;

    }


    // GPSを継続的に監視
    watchId = navigator.geolocation.watchPosition(

        // ====================================
        // 現在地を取得できた
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


            // ====================================
            // 初回
            // ====================================

            if (currentMarker === null) {

                currentMarker = L.marker(
                    [lat, lng],
                    {
                        icon: currentLocationIcon,

                        // 目的地ピンより前面に表示
                        zIndexOffset: 1000
                    }
                )
                .addTo(map);


                // 現在地をクリックしたとき
                currentMarker.bindPopup(
                    "現在地"
                );

            }


            // ====================================
            // 2回目以降
            // ====================================
            // 現在地画像だけを移動
            // ====================================

            else {

                currentMarker.setLatLng([
                    lat,
                    lng
                ]);

            }

        },


        // ====================================
        // GPS取得エラー
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
            // 高精度GPS
            enableHighAccuracy: true,

            // 古い位置情報を使用しない
            maximumAge: 0,

            // 10秒でタイムアウト
            timeout: 10000
        }

    );

}


// ========================================
// アプリ起動時に現在地監視開始
// ========================================

startLocationTracking();

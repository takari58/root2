const map = L.map("map").setView([37.955482, 139.338409], 15);
// OpenStreetMap
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap contributors"
    }
).addTo(map);

const goals = [
    {
        name: "新発田城跡",        //ランドマーク名称
        lat: 37.954824724543,   //緯度
        lng: 139.326001834219,  //経度
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
        lng:139.326564,
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
        lng:139.336,
    },
    {
        name: "藤倉メンチカツや",
        lat: 37.93682,
        lng:139.34488,
    },
    {
        name: "いっぷく",
        lat: 37.9443765405075,
        lng:139.340743962673,
    },
    {
        name: "文化洋食ino",
        lat: 37.9623641139771,
        lng:139.334281893588,
    },
    {
        name: "やすけカレー",
        lat:37.9377482726362,
        lng:139.336158926512,
    },
    {
        name: "レストラン蒲城",
        lat: 37.9504968436357,
        lng:139.339474708348,
    },
    {
        name: "コーヒーマリーナ 煉瓦屋",
        lat: 37.9491031178618,
        lng:139.324669426051,
    },
    {
        name: "パーラーやお屋",
        lat: 37.958499803976,
        lng:139.342528211321,
    }
];

// 使用する変数
let currentMarker = null;
let routeLine = null;

// 目的地ピン作成
goals.forEach(goal => {
    // マーカー生成
    const marker = L.marker([goal.lat, goal.lng]);
    marker.addTo(map);

    // ポップアップ
    marker.bindPopup(

        `<b>${goal.name}</b><br>
        `
    );
    // ピンをクリック
    marker.on("click", () => {
        startNavigation(goal);
    });
});

// ナビ開始
function startNavigation(goal) {

    // GPS取得
    navigator.geolocation.getCurrentPosition(

        function (position) {
            const myLat = position.coords.latitude;
            const myLng = position.coords.longitude;
            showRoute(
                myLat,
                myLng,
                goal
            );
        },

        function () {
            alert("現在地を取得できませんでした。");
        },
        {
            enableHighAccuracy: true
        }
    );
}

// ルート表示
async function showRoute(
    myLat,
    myLng,
    goal

) {

    // 古い現在地マーカー削除
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    // 古いルート削除
    if (routeLine) {
        map.removeLayer(routeLine);
    }
    // 現在地マーカー
    currentMarker = L.marker([myLat, myLng])
        .addTo(map)
        .bindPopup("現在地");

    const url =
`https://router.project-osrm.org/route/v1/walking/${myLng},${myLat};${goal.lng},${goal.lat}?overview=full&geometries=geojson`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        // ルートが存在するか確認
        if (!data.routes || data.routes.length === 0) {
            alert("ルートが見つかりません");
            return;
        }
        const route = data.routes[0];
        // GeoJSON → Leaflet形式へ変換
        const latlngs =
            route.geometry.coordinates.map(point => [
                point[1],
                point[0]
            ]);
        // 青線描画
        routeLine =
            L.polyline(
                latlngs,
                {
                    color: "blue",
                    weight: 6
                }
            ).addTo(map);

        // 地図をルート全体へ移動
        map.fitBounds(
            routeLine.getBounds()
        );
        // 距離
        const distance =
            (route.distance / 1000).toFixed(2);//m→kmへの変換＆小数点2位までに
        // 時間
        // 距離(m)
        const distanceMeter =
            route.distance;

        // 時速4km → 1分あたり約66.67m
        const minutes =
            Math.round(
            distanceMeter / 66.67
        );
        // 情報表示
        document.getElementById("info").innerHTML =
            `
            <b>${goal.name}</b><br>
            距離：${distance} km<br>
            所要時間：約 ${minutes} 分
            `;
    }
    catch (error) {
        console.error(error);
        alert("ルート検索に失敗しました。");
    }
}

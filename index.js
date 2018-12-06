/*
 * @Author: junjie.lean 
 * @Date: 2018-12-05 14:27:36 
 * @Last Modified by: junjie.lean
 * @Last Modified time: 2018-12-06 10:56:19
 */

//饿了么热门商品爬取
const fs = require('fs');
const axios = require('axios');
const url = '/restapi/shopping/restaurants?extras%5B%5D=activities&geohash=wm3ynp0ebkrs&latitude=30.625057&limit=100&longitude=103.975317&offset=0&restaurant_category_ids%5B%5D=-104&sign=1544061689860&terminal=web';


axios.defaults.baseURL = 'https://www.ele.me';

let getRestayrantsNearByLocaltion = async (url) => {
    let restaurantsNearBy = [];
    // let url = url;
    let res = await axios.get(url);
    let data;
    if (res.status == 200) {
        console.log('获取附近餐馆列表成功')
        data = res.data
    } else {
        console.log('获取附近餐馆列表失败')
        data = []
    }

    data.filter((item) => {
        //过滤送餐时间大于半小时的餐馆
        return item.order_lead_time < 30;
    }).map((item) => {

        restaurantsNearBy.push({
            name: item.name,
            addr: item.address,
            id: item.id,
            sendTime: item.order_lead_time
        })
    })
    return restaurantsNearBy;
}

let getHotMenuByRestaurantsID = async (idlist) => {
    let hotMenuList = [];

    for (let item of idlist) {
        let tmp = {
            restaurant_name: item.name,
            restaurants_addr: item.addr,
            restaurant_href: `https://www.ele.me/shop/${item.id}`,
            hotMenuList: []
        };
        let res = await axios.get(`/restapi/shopping/v2/menu?restaurant_id=${item.id}&terminal=web`);
        let data;
        if (res.status == 200) {
            console.log(item)
            console.log(`获取id为${item.id}餐馆热销菜单成功`)
            data = res.data;
        } else {
            console.log('获取id为${item.id}餐馆热销菜单失败')
            continue;
        }
        let hotfood = data[0] ? data[0].foods : [];
        hotfood.filter((item) => {
            let price = item.specfoods ? item.specfoods[0].price : item.price;
            return price != 0;
        }).map((item) => {
            tmp.hotMenuList.push({
                name: item.name,
                price: item.specfoods ? item.specfoods[0].price : item.price,
                salesPreMonth: item.month_sales
            })
        })
        // console.log(hotMenuList)
        hotMenuList.push(tmp)
    }
    return hotMenuList;
}

getRestayrantsNearByLocaltion(url).then((res) => {
    let hotMenuList = getHotMenuByRestaurantsID(res);
    return hotMenuList;
}).then((data) => {
    fs.writeFile('./data.json', JSON.stringify(data), { flag: 'w+' }, (err) => {
        if (err) {
            console.log('写入文件失败')
        }

    })
}).then(() => {
    console.log('写入文件成功')
})
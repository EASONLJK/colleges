<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { onMounted, reactive, toRaw, inject, onBeforeUnmount } from 'vue';
import axios from 'axios';
import * as d3 from 'd3';
// import { useStore } from '../../store/index.js'

function Map() {
  // let universities
  let data: any
  let point_data: any
  let province_datas: any
  // let store = useStore()
  let bus = inject('bus')
  let obj = reactive({
    province: [],
    province_data: [],
    province_geo: []
  })

  let url = "http://127.0.0.1:5000/mapbox/"
  axios.all([axios.get(url + "china"), axios.get(url + "point"), axios.get(url + "china_province"), axios.get(url + 'province_city'), axios.get(url + 'province_china'), axios.get(url + 'province_datas')]).then(axios.spread((china, point, china_province, province_city, province_china, province_data) => {
    data = china.data
    point_data = point.data
    obj.province = china_province.data
    obj.province_data = province_city.data
    obj.province_geo = province_china.data
    province_datas = province_data.data

    obj.province_geo.features.forEach((item: { properties: { color: any; }; }, index: number) => {
      // item.properties.color = colors[index]
    })

    mapboxgl.accessToken = 'pk.eyJ1IjoiZWFzb25samsiLCJhIjoiY2x0ZTBueXZ6MGJrczJ3cWwxaGRjcml2bSJ9._1-4RKjhaguCL9zMXxl_bQ';
    const map = new mapboxgl.Map({
      container: 'map',
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/light-v10',
      center: [103.4, 36.03],
      zoom: 3,
      logoPosition: 'bottom-right',
    });

    map.addControl(new MapboxLanguage({
      defaultLanguage: 'zh-Hans'
    }));

    //绘制中国地图
    map.on('load', () => {
      map.addLayer({
        id: 'china',
        type: 'fill',
        source: {
          type: 'geojson',
          data: data
        },
        layout: {},
        paint: {
          'fill-color': '#E0FFFF',
          'fill-opacity': 0.8
        }
      });
    })
    map.on('load', () => {
      map.addLayer({
        id: 'province',
        type: 'fill',
        source: {
          type: 'geojson',
          data: obj.province_geo
        },
        layout: {},
        paint: {
          // 'fill-color': ['get', 'color'],
          'fill-opacity': 0.4
        }
      });

      // 添加省份名称文本图层
      map.addLayer({
        id: 'province-label',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: obj.province_geo  // 使用同样的省份 GeoJSON 数据
        },
        layout: {
          'text-field': ['get', 'name'], // 假设每个省份的名称存储在属性 'name' 中
          'text-size': 10,  // 文本大小
          'text-transform': 'uppercase',  // 文本转换为大写
          'text-anchor': 'center',  // 文本锚点在中心
          'text-offset': [0, 0]  // 文本偏移，用于调整文本位置
        },
        paint: {
          'text-color': '#000000',  // 文本颜色
          'text-opacity': 0.85  // 文本透明度
        }
      });

      // store.province = province_datas[0].attributes
      map.on('click', 'province', (e: { features: { properties: { name: any; }; }[]; }) => {
        let province = e.features[0].properties.name
        let province_data = province_datas.filter((item: any) => {
          return item.name == province
        })
        //过滤province_data，获取其中attributes的值
        var province_data_detail = province_data.map((item: any) => {
          return item.attributes
        })
        // store.province = province_data_detail
        bus.emit('province', province_data_detail)
      })

    })


    //绘制每个省城市边界
    // map.on('load', () => {
    //   obj.province_data.forEach((item: any) => {
    //     let data = item
    //     map.addLayer({
    //       id: item.name,
    //       type: 'line',
    //       source: {
    //         type: 'geojson',
    //         data: data
    //       },
    //       layout: {
    //       },
    //       paint: {
    //         'line-color': 'grey',
    //         'line-opacity': 0.8
    //       }
    //     });
    //   })
    // })

    //mapbox cluster
    map.on('load', () => {
      map.addSource('points', {
        type: 'geojson',
        data: point_data,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'points',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            // '#FFFFFF',
            // 0,
            // '#f1f075',
            // 1,
            // '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'points',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'points',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      map.on('click', 'clusters', (e: { point: any; }) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('points').getClusterExpansionZoom(
          clusterId,
          (err: any, zoom: any) => {
            if (err) return;

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          }
        );
      });

      map.on('click', 'unclustered-point', (e: {
        features: {
          geometry: any; properties: { id: any; };
        }[]; lngLat: { lng: number; };
      }) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.id;
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `大学:${name}`
          )
          .addTo(map);
      });

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
    })

    // 中国每个省份放置自定义标记
    map.on('load', () => {
      obj.province.features.forEach((province: { properties: { attributes: any; center: any; name: string; }; }) => {
        let data = toRaw(province.properties.attributes);
        //获取字段
        const fields = ['state', 'total'];
        //根据字段对数据进行切割，并排序
        const data1 = fields.map((field: string) => {
          return data.map((item: { [x: string]: any; }) => {
            return {
              total: item['total']
            }
          }).sort((a: { total: number; }, b: { total: number; }) => b.total - a.total)
        })

        const block_value = data.reduce((acc: any, cur: { total: any; }) => acc + cur.total, 0)
        const svg_box = document.createElement('div');
        svg_box.className = 'marker';
        svg_box.style.width = '50px';
        svg_box.style.height = '50px';
        const width = 40
        const height = 40

        const innerRadius = 0
        const outerRadius = 5

        const pieData = d3.pie()
          .value((d: { total: any; }) => d.total)
          .sort((a: { total: number; }, b: { total: number; }) => a.total - b.total)(data)

        const arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius((d: { data: { state: string; }; }) => {
            const state = ['专科', '普通高校', '双一流', '211', '985']
            const index = state.indexOf(d.data.state)
            return outerRadius + index * 3
          })

        const color = d3.scaleOrdinal()
          .domain(data.map((d: { state: any; }) => d.state))
          .range(
            ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF']
          )

        const svg = d3.select(svg_box)
          .append('svg')
          .attr('width', width)
          .attr('height', height)

        const arcGroup = svg.append('g')
          .attr("transform", `translate(${width / 2}, ${height / 2})`)
          .selectAll('path')
          .data(pieData)

        arcGroup.join("path")
          .attr("fill", (d: any, i: any) => color(i))
          .attr("d", arc)
          // 显示每个path的title
          .append('title')
          .text((d: { data: { state: any; total: any; }; }) => {
            return `${d.data.state}:${d.data.total}`
          })

        // 向地图添加自定义图形
        new mapboxgl.Marker(svg_box)
          .setLngLat(province.properties.center)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML('<h3>' + province.properties.name + '</h3>'
              + '<p>' + '985:' + data[0].total + '</p>'
              + '<p>' + '211:' + data[1].total + '</p>'
              + '<p>' + '双一流:' + data[2].total + '</p>'
              + '<p>' + '普通本科:' + data[3].total + '</p>'
              + '<p>' + '专科:' + data[4].total + '</p>'
              + '<h4>' + '高校总数:' + block_value + '</h4>'
            ))
          .addTo(map);
      })
    })

    map.on('load', function () {
      // 创建图例容器
      const legend = document.createElement('div');
      legend.className = 'legend';
      legend.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    width: 80px;
    background: rgba(255,255,255,0.8);
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    z-index: 1;
  `;

      const legendColor = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF'];
      const legendText = ['985', '211', '双一流', '普通本科', '专科'];

      // 循环创建图例项
      legendColor.forEach((color, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    `;
        item.innerHTML = `
      <span style="background:${color}; width: 20px; height: 20px; display: inline-block;"></span>
      <span style="margin-left: 5px;">${legendText[index]}</span>
    `;
        legend.appendChild(item);
      });
      // 添加图例至地图容器
      map.getContainer().appendChild(legend);
    });

  }))

}

onMounted(() => {
  Map()
})

</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
  top: 0;
  bottom: 0;
}
</style>

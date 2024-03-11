<template>
    <div class="dialog" v-if="visible" :style="{ left: left + 'px', top: top + 'px' }" @mousedown="onMouseDown"
        @mousemove="onMouseMove" @mouseup="onMouseUp">
        <div class="top_bar">
            <button class="close" @click="closeDialog">X</button>
        </div>
        <!--为prob_name生成一个方阵，行列名称都为probNames中的数据-->
        <div class="prob_name">
            <table>
                <tr>
                    <td></td>
                    <td v-for="probName in probNames">{{ probName }}</td>
                </tr>
                <tr v-for="(probName1, index1) in probNames">
                    <td>{{ probName1 }}</td>
                    <td v-for="(probName2, index2) in probNames">
                        <template v-if="index1 === index2">
                            1
                        </template>
                        <template v-else-if="index1 > index2">
                            <input v-model="weights[probName1 + probName2]" />
                        </template>
                        <template v-else>
                            {{ 1 / weights[probName2 + probName1] }}
                        </template>
                    </td>
                </tr>
            </table>
        </div>

        <!--为natureNames生成一个方阵，行列名称都为natureNames中的数据-->
        <div class="nature_name">
            <table>
                <tr>
                    <td></td>
                    <td v-for="natureName in natureNames">{{ natureName }}</td>
                </tr>
                <tr v-for="(natureName1, index1) in natureNames">
                    <td>{{ natureName1 }}</td>
                    <td v-for="(natureName2, index2) in natureNames">
                        <template v-if="index1 === index2">
                            1
                        </template>
                        <template v-else-if="index1 > index2">
                            <input v-model="weights[natureName1 + natureName2]" />
                        </template>
                        <template v-else>
                            {{ 1 / weights[natureName2 + natureName1] }}
                        </template>
                    </td>
                </tr>
            </table>
        </div>

         <!--为schoolLevels生成一个方阵，行列名称都为schoolLevels中的数据-->
         <div class="school_level">
            <table>
                <tr>
                    <td></td>
                    <td v-for="schoolLevel in schoolLevels">{{ schoolLevel }}</td>
                </tr>
                <tr v-for="(schoolLevel1, index1) in schoolLevels">
                    <td>{{ schoolLevel1 }}</td>
                    <td v-for="(schoolLevel2, index2) in schoolLevels">
                        <template v-if="index1 === index2">
                            1
                        </template>
                        <template v-else-if="index1 > index2">
                            <input v-model="weights[schoolLevel1 + schoolLevel2]" />
                        </template>
                        <template v-else>
                            {{ 1 / weights[schoolLevel2 + schoolLevel1] }}
                        </template>
                    </td>
                </tr>
            </table>
        </div>

        <!--为heatNames生成一个方阵，行列名称都为heatNames中的数据-->
        <div class="heat_name">
            <table>
                <tr>
                    <td></td>
                    <td v-for="heatName in heatNames">{{ heatName }}</td>
                </tr>
                <tr v-for="(heatName1, index1) in heatNames">
                    <td>{{ heatName1 }}</td>
                    <td v-for="(heatName2, index2) in heatNames">
                        <template v-if="index1 === index2">
                            1
                        </template>
                        <template v-else-if="index1 > index2">
                            <input v-model="weights[heatName1 + heatName2]" />
                        </template>
                        <template v-else>
                            {{ 1 / weights[heatName2 + heatName1] }}
                        </template>
                    </td>
                </tr>
            </table>
        </div>


        <!--为areaNames生成一个方阵，行列名称都为areaNames中的数据-->
        <div class="area_name">
            <table>
                <tr>
                    <td></td>
                    <td v-for="areaName in areaNames">{{ areaName }}</td>
                </tr>
                <tr v-for="(areaName1, index1) in areaNames">
                    <td>{{ areaName1 }}</td>
                    <td v-for="(areaName2, index2) in areaNames">
                        <template v-if="index1 === index2">
                            1
                        </template>
                        <template v-else-if="index1 > index2">
                            <input v-model="weights[areaName1 + areaName2]" />
                        </template>
                        <template v-else>
                            {{ 1 / weights[areaName2 + areaName1] }}
                        </template>
                    </td>
                </tr>
            </table>
        </div>

        <!--为endFunds生成一个方阵，行列名称都为endFunds中的数据-->
        <div class="end_fund">
            <table>
                <tr>
                    <td></td>
                    <td v-for="endFund in endFunds">{{ endFund }}</td>
                </tr>
                <tr v-for="(endFund1, index1) in endFunds">
                    <td>{{ endFund1 }}</td>
                    <td v-for="(endFund2, index2) in endFunds">
                        <template v-if="index1 === index2">
                            1
                        </template>
                        <template v-else-if="index1 > index2">
                            <input v-model="weights[endFund1 + endFund2]" />
                        </template>
                        <template v-else>
                            {{ 1 / weights[endFund2 + endFund1] }}
                        </template>
                    </td>
                </tr>
            </table>
        </div>

        <!--为typeNames生成一个方阵，行列名称都为typeNames中的数据-->
        <div class="type_name">
            <table>
                <tr>
                    <td></td>
                    <td v-for="typeName in typeNames">{{ typeName }}</td>
                </tr>
                <tr v-for="(typeName1, index1) in typeNames">
                    <td>{{ typeName1 }}</td>
                    <td v-for="(typeName2, index2) in typeNames">
                        <template v-if="index1 === index2">
                            1
                        </template>
                        <template v-else-if="index1 > index2">
                            <input v-model="weights[typeName1 + typeName2]" />
                        </template>
                        <template v-else>
                            {{ 1 / weights[typeName2 + typeName1] }}
                        </template>
                    </td>
                </tr>
            </table>
        </div>

        <button @click="onOk">确定</button>
        <button @click="onCancel">取消</button>
    </div>
</template>

<script>
export default {
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            natureName: '',
            schoolLevel: '',
            typeName: '',
            weights: { '华北东北': 3,
                    '西北东北': 5,
                    '西北华北': 3,
                    '华中东北': 7,
                    '华中华北': 4,
                    '华中西北': 5,
                    '华东东北': 3,
                    '华东华北': 5,
                    '华东西北': 4,
                    '华东华中': 1/3,
                    '西南东北': 8,
                    '西南华北': 7,
                    '西南西北': 9,
                    '西南华中': 5,
                    '西南华东': 6,
                    '华南东北': 2,
                    '华南华北': 7,
                    '华南西北': 6,
                    '华南华中': 4,
                    '华南华东': 5,
                    '华南西南': 1/5,
                    '中高经费高经费': 1/3,
                    '中等经费高经费': 1/5,
                    '中等经费中高经费': 1/2,
                    '中低经费高经费': 1/7,
                    '中低经费中高经费': 1/5,
                    '中低经费中等经费': 1/3,
                    '低经费高经费': 1/9,
                    '低经费中高经费': 1/5,
                    '低经费中等经费': 1/3,
                    '低经费中低经费': 1/2,
                    '民办公办': 1/7,
                    '中外合办公办': 1/3,
                    '内港澳合办公办': 1/4,
                    '中外合办民办': 2,
                    '内港澳合办民办': 1/3,
                    '内港澳合办中外合办': 1/5,
                    '211985': 1/5,
                    '双一流985': 1/6,
                    '普通本科985': 1/7,
                    '专科985': 1/9,
                    '双一流211': 1/6,
                    '普通本科211': 1/7,
                    '专科211': 1/9,
                    '普通本科双一流': 1/3,
                    '专科双一流': 1/8,
                    '专科普通本科': 1/7,
                    '理工综合': 5,
                    '师范综合': 3,
                    '农林综合': 1/5,
                    '政法综合': 1/4,
                    '艺术综合': 1/9,
                    '财经综合': 1/6,
                    '民族综合': 1/7,
                    '医药综合': 1/6,
                    '其他综合': 1/9,
                    '军事综合': 1/3,
                    '体育综合': 1/9,
                    '语言综合': 1/7,
                    '师范理工': 1/5,
                    '农林理工': 1/7,
                    '政法理工': 1/8,
                    '艺术理工': 1/9,
                    '财经理工': 1/8,
                    '民族理工': 1/7,
                    '医药理工': 1/3,
                    '其他理工': 1/9,
                    '军事理工': 1/3,
                    '体育理工': 1/5,
                    '语言理工': 1/7,
                    '农林师范': 1/3,
                    '政法师范': 1/3,
                    '艺术师范': 1/5,
                    '财经师范': 1/2,
                    '民族师范': 1/2,
                    '医药师范': 3,
                    '其他师范': 1/9,
                    '军事师范': 5,
                    '体育师范': 1/5,
                    '语言师范': 1/2,
                    '政法农林': 5,
                    '艺术农林': 1/2,
                    '财经农林': 3,
                    '民族农林': 2,
                    '医药农林': 5,
                    '其他农林': 1/7,
                    '军事农林': 7,
                    '体育农林': 2,
                    '语言农林': 3,
                    '艺术政法': 1/5,
                    '财经政法': 2,
                    '民族政法': 1/5,
                    '医药政法': 3,
                    '其他政法': 1/5,
                    '军事政法': 4,
                    '体育政法': 1/4,
                    '语言政法': 1/3,
                    '财经艺术': 4,
                    '民族艺术': 1/2,
                    '医药艺术': 5,
                    '其他艺术': 1/3,
                    '军事艺术': 7,
                    '体育艺术': 2,
                    '语言艺术': 3,
                    '民族财经': 1/4,
                    '医药财经': 3,
                    '其他财经': 1/3,
                    '军事财经': 5,
                    '体育财经': 1/3,
                    '语言财经': 1/4,
                    '医药民族': 5,
                    '其他民族': 1/2,
                    '军事民族': 7,
                    '体育民族': 2,
                    '语言民族': 1/2,
                    '其他医药': 1/5,
                    '军事医药': 5,
                    '体育医药': 1/2,
                    '语言医药': 1/4,
                    '军事其他': 9,
                    '体育其他': 6,
                    '语言其他': 3,
                    '体育军事': 4,
                    '语言军事': 1/7,
                    '语言体育': 1/2,
                    '热门大热门': 1/3,
                    '中等热门大热门': 1/5,
                    '偏冷门大热门': 1/7,
                    '冷门大热门': 1/9,
                    '中等热门热门': 1/3,
                    '偏冷门热门': 1/5,
                    '冷门热门': 1/7,
                    '偏冷门中等热门': 1/3,
                    '冷门中等热门': 1/5,
                    '冷门偏冷门': 1/3, 
                    '稳冲': 1/3,
                    '保冲': 1/5,
                    '不录取冲': 1/7,
                    '保稳': 1/3,
                    '不录取稳': 1/5,
                    '不录取保': 1/3,},
            areaNames: ['东北', '华北', '西北', '华中', '华东', '西南', '华南'],
            endFunds: ['高经费', '中高经费', '中等经费', '中低经费', '低经费'],
            natureNames: ['公办', '民办', '中外合办', '内港澳合办'],
            schoolLevels: ['985', '211', '双一流', '普通本科', '专科'],
            typeNames: ['综合', '理工', '师范', '农林', '政法', '艺术', '财经', '民族', '医药', '其他', '军事', '体育', '语言'],
            heatNames: ['大热门', '热门', '中等热门', '偏冷门', '冷门'],
            probNames: ['冲', '稳', '保', '不录取'],
            dragging: false,
            // 对话框的位置，位于屏幕中心
            left: window.innerWidth - 300,
            top: (window.innerHeight - 300) / 2,
        };
    },
    methods: {
        onOk() {
            const areaNameWeights = [];
            const endFundWeights = [];
            const natureNameWeights = [];
            const schoolLevelWeights = [];
            const typeNameWeights = [];
            const heatNameWeights = [];
            const probNameWeights = [];

            for (let i = 0; i < this.areaNames.length; i++) {
                const areaNameWeight = [];
                for (let j = 0; j < this.areaNames.length; j++) {
                    if (i === j) {
                        areaNameWeight.push(1);
                    } else if (i > j) {
                        areaNameWeight.push(this.weights[this.areaNames[i] + this.areaNames[j]]);
                    } else {
                        areaNameWeight.push(1 / this.weights[this.areaNames[j] + this.areaNames[i]]);
                    }
                }
                areaNameWeights.push(areaNameWeight);
            }
            
            for (let i = 0; i < this.endFunds.length; i++) {
                const endFundWeight = [];
                for (let j = 0; j < this.endFunds.length; j++) {
                    if (i === j) {
                        endFundWeight.push(1);
                    } else if (i > j) {
                        endFundWeight.push(this.weights[this.endFunds[i] + this.endFunds[j]]);
                    } else {
                        endFundWeight.push(1 / this.weights[this.endFunds[j] + this.endFunds[i]]);
                    }
                }
                endFundWeights.push(endFundWeight);
            }

            for (let i = 0; i < this.natureNames.length; i++) {
                const natureNameWeight = [];
                for (let j = 0; j < this.natureNames.length; j++) {
                    if (i === j) {
                        natureNameWeight.push(1);
                    } else if (i > j) {
                        natureNameWeight.push(this.weights[this.natureNames[i] + this.natureNames[j]]);
                    } else {
                        natureNameWeight.push(1 / this.weights[this.natureNames[j] + this.natureNames[i]]);
                    }
                }
                natureNameWeights.push(natureNameWeight);
            }

            for (let i = 0; i < this.schoolLevels.length; i++) {
                const schoolLevelWeight = [];
                for (let j = 0; j < this.schoolLevels.length; j++) {
                    if (i === j) {
                        schoolLevelWeight.push(1);
                    } else if (i > j) {
                        schoolLevelWeight.push(this.weights[this.schoolLevels[i] + this.schoolLevels[j]]);
                    } else {
                        schoolLevelWeight.push(1 / this.weights[this.schoolLevels[j] + this.schoolLevels[i]]);
                    }
                }
                schoolLevelWeights.push(schoolLevelWeight);
            }

            for (let i = 0; i < this.typeNames.length; i++) {
                const typeNameWeight = [];
                for (let j = 0; j < this.typeNames.length; j++) {
                    if (i === j) {
                        typeNameWeight.push(1);
                    } else if (i > j) {
                        typeNameWeight.push(this.weights[this.typeNames[i] + this.typeNames[j]]);
                    } else {
                        typeNameWeight.push(1 / this.weights[this.typeNames[j] + this.typeNames[i]]);
                    }
                }
                typeNameWeights.push(typeNameWeight);
            }

            for (let i = 0; i < this.heatNames.length; i++) {
                const heatNameWeight = [];
                for (let j = 0; j < this.heatNames.length; j++) {
                    if (i === j) {
                        heatNameWeight.push(1);
                    } else if (i > j) {
                        heatNameWeight.push(this.weights[this.heatNames[i] + this.heatNames[j]]);
                    } else {
                        heatNameWeight.push(1 / this.weights[this.heatNames[j] + this.heatNames[i]]);
                    }
                }
                heatNameWeights.push(heatNameWeight);
            }

            for (let i = 0; i < this.probNames.length; i++) {
                const probNameWeight = [];
                for (let j = 0; j < this.probNames.length; j++) {
                    if (i === j) {
                        probNameWeight.push(1);
                    } else if (i > j) {
                        probNameWeight.push(this.weights[this.probNames[i] + this.probNames[j]]);
                    } else {
                        probNameWeight.push(1 / this.weights[this.probNames[j] + this.probNames[i]]);
                    }
                }
                probNameWeights.push(probNameWeight);
            }
            this.$emit('ok', areaNameWeights, endFundWeights, natureNameWeights, schoolLevelWeights, typeNameWeights, heatNameWeights, probNameWeights);
        },
        onCancel() {
            this.$emit('cancel');
        },
        closeDialog() {
            this.$emit('cancel');
        },
        onMouseDown(event) {
            this.dragging = true
            this.diffX = event.clientX - this.left
            this.diffY = event.clientY - this.top
        },
        onMouseMove(event) {
            if (this.dragging) {
                this.left = event.clientX - this.diffX
                this.top = event.clientY - this.diffY
            }
        },
        onMouseUp() {
            this.dragging = false
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.onOk();
        });
    }
};

</script>

<style>
.dialog {
    position: fixed;
    transform: translate(-80%, -20%);
    max-width: 600px;
    /* 设置最大宽度 */
    max-height: 600px;
    /* 设置最大高度 */
    position: absolute;
    /* 设置绝对定位 */
    border: 1px solid #ccc;
    /* 设置边框 */
    background-color: #fff;
    /* 设置背景颜色 */
    overflow: auto;
    /* 当内容超出范围时，显示滚动条 */
}

input {
    width: 20px;
    height: 20px;
    border: none;
}

.dialog table {
    border-collapse: collapse;
}

.dialog table td {
    border: 1px solid black;
    padding: 5px;
    font-size: 6px;
    text-align: center;
    white-space: nowrap;
    /* 不允许换行 */
    overflow: hidden;
    /* 超出部分隐藏 */
    text-overflow: ellipsis;
    /* 使用省略号代替超出部分 */
}

.area_name,
.end_fund,
.nature_name,
.school_level,
.type_name,
.heat_name,
.prob_name {
    padding: 10px;
    /* 设置内边距 */
    box-sizing: border-box;
    /* 让内边距和边框不会撑大元素 */
    /* 将div往下移动 */
    margin-top: 20px;
}

.top_bar {
    background-color: #adccf0;
    /* 设置背景颜色 */
    padding: 10px;
    /* 设置内边距 */
    box-sizing: border-box;
    /* 让内边距和边框不会撑大元素 */
   
}

.close {
    float: right;
    /* 设置元素浮动 */
    font-size: 14px;
    /* 设置字体大小 */
    cursor: pointer;
    /* 设置鼠标样式为手型 */
    margin-top: -10px;
}
</style>./custom_weights.vue
const COLOR_NUMBER_BITS = 7;
const COLOR_DEFINITION_Y_BITS = 8;
const COLOR_DEFINITION_C_BITS = 4;

const COLOR_NUMBER = Math.pow(2, COLOR_NUMBER_BITS);
const COLOR_DEFINITION = 256;
const COLOR_DEFINITION_Y = Math.pow(2, COLOR_DEFINITION_Y_BITS);
const COLOR_DEFINITION_C = Math.pow(2, COLOR_DEFINITION_C_BITS);

class ColorCube {
    constructor(clr_lst = []) {

        this.corner1 = [COLOR_DEFINITION - 1, COLOR_DEFINITION - 1, COLOR_DEFINITION - 1];
        this.corner2 = [0, 0, 0];

        this.clr_lst = clr_lst;
    }

    cut() {
        this.corner1 = [COLOR_DEFINITION - 1, COLOR_DEFINITION - 1, COLOR_DEFINITION - 1];
        this.corner2 = [0, 0, 0];

        for (const clr of this.clr_lst) {
            for (let i = 0; i < 3; i++) {
                if (clr[i] < this.corner1[i]) {
                    this.corner1[i] = clr[i];
                }
                if (clr[i] > this.corner2[i]) {
                    this.corner2[i] = clr[i];
                }
            }
        }

        let diff = [this.corner2[0] - this.corner1[0], this.corner2[1] - this.corner1[1], this.corner2[2] - this.corner1[2]];
        const longestEdgeIdx = diff.indexOf(Math.max(...diff));

        let med = quickselect(this.clr_lst, (a, b) => {
            return a[longestEdgeIdx] < b[longestEdgeIdx] ? -1 : a[longestEdgeIdx] > b[longestEdgeIdx] ? 1 : 0;
        });

        let halves = [
            [],
            []
        ];

        for (const clr of this.clr_lst) {
            if (clr[longestEdgeIdx] < med[longestEdgeIdx]) {
                halves[0].push(clr);
            } else if (clr[longestEdgeIdx] > med[longestEdgeIdx]) {
                halves[1].push(clr);
            } else if (halves[0].length <= halves[1].length) {
                halves[0].push(clr);
            } else {
                halves[1].push(clr);
            }
        }

        return halves;
    }

    getMeanClr(clrMap, colorTableIndex) {
        let sum = [0, 0, 0];
        let totalWeight = 0;
        for (const clr of this.clr_lst) {
            let integratedClr = (clr[0] << 16) + (clr[1] << 8) + clr[2];
            let weight = clrMap[integratedClr];
            totalWeight += weight;
            clrMap[integratedClr] = colorTableIndex;
            for (let i = 0; i < 3; i++) {
                sum[i] += clr[i] * weight;
            }
        }
        for (let i = 0; i < 3; i++) {
            sum[i] = Math.min(COLOR_DEFINITION - 1, Math.round(sum[i] / totalWeight));
        }

        return sum;
    }
}

class ColorTable {
    constructor(frameData) {

        this.colorMap = {};
        this.colorTable = [];

        let curCube = new ColorCube();

        for (let i = 0; i < frameData.length; i++) {
            let integratedClr = (frameData[i][1] << 16) + (frameData[i][2] << 8) + frameData[i][3];
            if (!(integratedClr in this.colorMap)) {
                this.colorMap[integratedClr] = 1;
                curCube.clr_lst.push([frameData[i][1], frameData[i][2], frameData[i][3]]);
                //console.log("b%c" + frameData[i][1] + " " + frameData[i][2] + " " + frameData[i][3], "color: rgb(" + frameData[i][1] + "," + frameData[i][2] + "," + frameData[i][3] + ");");
            } else {
                this.colorMap[integratedClr]++;
            }
        }

        let queue = [];
        let queueIndex = 0;
        queue.push(curCube);
        let totalClr = curCube.clr_lst.length;
        while (queue.length - queueIndex < Math.min(totalClr, COLOR_NUMBER) - 1) {
            curCube = queue[queueIndex];
            queueIndex++;

            let newCubes = curCube.cut();
            queue.push(new ColorCube(newCubes[0]));
            if (newCubes[1].length > 0) {
                queue.push(new ColorCube(newCubes[1]));
            }
        }

        let colorTableIndex = 0;
        for (; queueIndex < queue.length; queueIndex++) {
            curCube = queue[queueIndex];
            let meanClr = curCube.getMeanClr(this.colorMap, colorTableIndex);
            //console.log("a%c" + meanClr[0] + " " + meanClr[1] + " " + meanClr[2], "color: rgb(" + meanClr[0] + "," + meanClr[1] + "," + meanClr[2] + ");");
            this.colorTable.push(meanClr);
            colorTableIndex++;
        }
    }
}

function quickselect(arr, compare) {
    let mid = Math.floor(arr.length / 2);
    quickselectStep(arr, mid, 0, (arr.length - 1), compare || defaultCompare);
    return arr[mid];
}

function quickselectStep(arr, k, left, right, compare) {

    while (right > left) {
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselectStep(arr, k, newLeft, newRight, compare);
        }

        var t = arr[k];
        var i = left;
        var j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
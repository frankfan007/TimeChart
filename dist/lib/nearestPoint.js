import { domainSearch } from './utils';
export class NearestPoint {
    constructor(svg, model, options, detector) {
        var _a;
        this.model = model;
        this.options = options;
        this.intersectPoints = new Map();
        this.lastX = null;
        const initTrans = svg.svgNode.createSVGTransform();
        initTrans.setTranslate(0, 0);
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
        .timechart-crosshair-intersect {
            fill: ${this.options.backgroundColor};
            visibility: hidden;
        }
        .timechart-crosshair-intersect circle {
            r: 3px;
        }
        `;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('timechart-crosshair-intersect');
        g.appendChild(style);
        for (const s of this.options.series) {
            const intersect = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            intersect.style.stroke = s.color.toString();
            intersect.style.strokeWidth = `${(_a = s.lineWidth) !== null && _a !== void 0 ? _a : this.options.lineWidth}px`;
            intersect.transform.baseVal.initialize(initTrans);
            g.appendChild(intersect);
            this.intersectPoints.set(s, intersect);
        }
        detector.node.addEventListener('mousemove', ev => {
            const rect = svg.svgNode.getBoundingClientRect();
            this.lastX = ev.clientX - rect.left;
            this.adjustIntersectPoints();
        });
        detector.node.addEventListener('mouseenter', ev => g.style.visibility = 'visible');
        detector.node.addEventListener('mouseleave', ev => g.style.visibility = 'hidden');
        svg.svgNode.appendChild(g);
        model.updated.on(() => this.adjustIntersectPoints());
    }
    adjustIntersectPoints() {
        if (this.lastX === null) {
            return;
        }
        const domain = this.model.xScale.invert(this.lastX);
        for (const s of this.options.series) {
            const pos = domainSearch(s.data, 0, s.data.length, domain, d => d.x);
            const near = [];
            if (pos > 0) {
                near.push(s.data[pos - 1]);
            }
            if (pos < s.data.length) {
                near.push(s.data[pos]);
            }
            const sortKey = (a) => Math.abs(a.x - domain);
            near.sort((a, b) => sortKey(a) - sortKey(b));
            const intersect = this.intersectPoints.get(s);
            if (!intersect) {
                continue; // TODO: Dynamic add series
            }
            intersect.transform.baseVal.getItem(0).setTranslate(this.model.xScale(near[0].x), this.model.yScale(near[0].y));
        }
    }
}
NearestPoint.meta = {
    name: 'nearestPoint',
    required: ['svgLayer', 'model', 'options', 'contentBoxDetector']
};
//# sourceMappingURL=nearestPoint.js.map
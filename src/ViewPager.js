import React, { Children, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { usePanGestures } from './util/gestures';
import { useAnimatedValue } from './util/animated';
import { c, clamp, toPercent } from './util';
import { useGesture } from './util/gesture.js';

const PagerDot = ({pan, i}) => {
    const el = useRef();

    useEffect(() => {
        return pan.on(value => {
            const dist = Math.abs(i - value);
            el.current.style.opacity = Math.max(.5, 1 - dist);
        });
    }, []);

    return (
        <div
            className="pager-dot"
            ref={el}
            style={{opacity: pan.value === i ? 1 : .5}}
        />
    );
};

const PagerTabTitle = ({title, i, pan, onPress}) => {
    const el = useRef();
    useEffect(() => {
        return pan.on(value => {
            const dist = Math.abs(i - value);
            el.current.style.opacity = Math.max(0.5, 1 - dist);
        });
    }, []);
    return (
        <div
            children={title}
            className="pager-tabs-title"
            onClick={() => onPress(i)}
            ref={el}
            style={{opacity: (pan.value === i) ? 1 : .5}}
        />
    );
};

export const ViewPager = forwardRef(({titles, children, vertical, dots, className, page = 0}, ref) => {
    const pan = useAnimatedValue(page);
    const indicatorEl = useRef();
    const scrollerEl = useRef();
    const refs = useRef({}).current;
    const lastIndex = Children.count(children) - 1;
    const orientation = vertical ? 'y' : 'x';

    const clampPage = (i) => clamp(i, 0, lastIndex);

    useImperativeHandle(ref, () => ({
        scrollToPage: (i) => pan.spring(i),
    }));

    const {width, height} = useGesture(scrollerEl, {
        enablePointerControls: true,
        onCapture: e => {
            if (e.direction === orientation) {
                if (e.distance < 0) return true; // Don't capture at the left edge
                return (refs.initPan - (e.distance / e.size)) > 0;
            }
        },
        onDown: e => {
            refs.currentPage = Math.round(pan.value);
            refs.initPan = pan.value;
        },
        onMove: e => {
            const val = clampPage(refs.initPan - (e.distance / e.size));
            pan.setValue(val);
        },
        onPan: e => { // ScrollWheel
            pan.setValue(clampPage(pan.value + (e.d.x / width)));
        },
        onUp: e => {
            if (e.flickedLeft || e.flickedDown) { // Increment page
                if (refs.currentPage < lastIndex) pan.spring(refs.currentPage + 1, e.springMs);
            } else if (e.flickedRight || e.flickedUp) { // Decrement page
                if (refs.currentPage > 0) pan.spring(refs.currentPage - 1, e.springMs);
            } else { // Snap back to current page
                const landingPage = clampPage(Math.round(pan.value));
                pan.spring(landingPage);
            }
        },
    }, [children]);

    useEffect(() => {
        pan.spring(page);
    }, [page]);

    useEffect(() => {
        return pan.on(value => {
            if (vertical) {
                scrollerEl.current.style.transform = `translateY(-${value * height}px)`;
            } else {
                scrollerEl.current.style.transform = `translateX(-${value * width}px)`;
                if (indicatorEl.current) indicatorEl.current.style.transform = `translateX(${toPercent(value)})`;
            }
        });
    }, [vertical, height, width]);

    return (
        <div className={c('pager', vertical ? 'vertical' : 'horizontal', className)}>
            {titles ? (
                <div className="pager-tabs">
                    {titles.map((title, i) => (
                        <PagerTabTitle
                            key={i}
                            title={title}
                            pan={pan}
                            i={i}
                            onPress={pan.spring}
                        />
                    ))}
                    {width ? (
                        <div
                            className="pager-tabs-indicator"
                            ref={indicatorEl}
                            style={{width: toPercent(1 / titles.length)}}
                        />
                    ) : null}
                </div>
            ) : null}
            <div className="pager-scroller">
                <div
                    className="pager-canvas"
                    ref={scrollerEl}
                    style={{transform: vertical ? `translateY(-${toPercent(page)})` : `translateX(-${toPercent(page)})`}}
                >
                    {Children.map(children, (child, i) => (
                        <div key={i} className="pager-page" children={child}/>
                    ))}
                </div>
            </div>
            {dots ? (
                <div className="pager-dots">
                    {Children.map(children, (child, i) => (
                        <PagerDot key={i} pan={pan} i={i}/>
                    ))}
                </div>
            ) : null}
        </div>
    );
});
import React, { forwardRef, Fragment, useEffect, useRef } from 'react';
import { useAnimatedValue } from './util/animated';
import { c } from './util';
import { PullIndicator } from './PullIndicator';
import { useGesture } from './util/gesture.js';

export const ScrollView = forwardRef(({children, className, onRefresh, horizontal}, ref) => {
    const el = ref || useRef();
    const spinnerEl = useRef();
    const refs = useRef({}).current;
    const pull = useAnimatedValue(0);
    const scrollY = useAnimatedValue(0);
    const scrollX = useAnimatedValue(0);

    useGesture(el, {
        onDown: () => {
            refs.canScrollVertical = (el.current.scrollHeight > el.current.clientHeight);
            refs.canScrollHorizontal = (el.current.scrollWidth > el.current.clientWidth);
            refs.initScrollTop = el.current.scrollTop;
            refs.initScrollLeft = el.current.scrollLeft;
            scrollY.stop();
            scrollX.stop();
        },
        onCapture: (e) => {
            if (e.direction === 'y') {
                if (onRefresh && el.current.scrollTop === 0 && e.distance > 0) return true; // pull to refresh
                if (!refs.canScrollVertical) return false; // not a scroller
                if (refs.initScrollTop === 0 && e.distance < 0) return true; // beginning to scroll down
                return (refs.initScrollTop > 0);
            }
            if (e.direction === 'x') {
                if (!refs.canScrollHorizontal) return false;
                return true;
                // return (refs.initScrollLeft > 0);
            }
        },
        onMove: (e) => {
            if (e.direction === 'y') {
                if (onRefresh && refs.initScrollTop === 0) { // Reveal pull to refresh indicator
                    pull.setValue(Math.min(70, e.distance));
                } else {
                    scrollY.setValue(refs.initScrollTop - e.distance);
                }
            } else if (e.locked === 'x') {
                scrollX.setValue(refs.initScrollLeft - e.distance);
            }
        },
        onUp: (e) => {
            if (e.direction === 'y') {
                if (onRefresh && refs.initScrollTop === 0) { // Pull to refresh
                    if (e.distance > 70) {
                        pull.spring(0).then(onRefresh);
                    } else {
                        pull.spring(0);
                    }
                } else if (e.velocity) { // Coast scrolling
                    scrollY.spring(scrollY.value - (e.velocity * 2000), 2000);
                }
            } else if (e.locked === 'h') {
                if (e.velocity) scrollX.spring(scrollX.value - (e.velocity * 2000), 2000); // Coast scrolling
            }
        },
    });

    useEffect(() => { // Scrolling Y
        return scrollY.on(val => {
            el.current.scrollTop = val;
        });
    }, []);

    useEffect(() => { // Scrolling X
        return scrollX.on(val => el.current.scrollLeft = val);
    }, []);

    useEffect(() => {
        if (!onRefresh) return;
        return pull.on(val => {
            const percent = (val / 70);
            spinnerEl.current.style.transform = `translateY(${val}px) rotate(${percent * 360}deg)`;
            spinnerEl.current.style.opacity = percent;
        });
    }, []);

    const scroll = () => {
        navigator.virtualKeyboard?.hide();
        document.activeElement.blur();
    };

    return (
        <Fragment>
            {onRefresh ? (
                <div className="list-pull">
                    <PullIndicator pull={pull} ref={spinnerEl}/>
                </div>
            ) : null}
            <div
                className={c('scroller', className, horizontal ? 'horizontal' : 'vertical')}
                ref={el}
                onScroll={scroll}
                children={children}
            />
        </Fragment>
    );
});
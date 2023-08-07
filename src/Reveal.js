import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { navigation } from 'poon-router';
import { useAnimatedValue } from './util/animated';
import { ScreenHeader } from './ScreenHeader';
import { c, toPercent } from './util/index.js';
import { useGesture } from './util/gesture.js';

let origin = {};

export const Reveal = forwardRef(({
                                      children,
                                      title,
                                      headerRight,
                                      onClose,
                                      isVisible,
                                      animateIn,
                                      className,
                                  }, ref) => {
    const el = useRef();
    const innerEl = useRef();
    const pan = useAnimatedValue(animateIn ? 0 : 1);

    const close = () => navigation.goBack(1);

    useImperativeHandle(ref, () => ({
        close,
    }));

    const {width, height} = useGesture(el, {
        onCapture(e) {
            return (e.direction === 'x' && e.distance > 0);
        },
        onMove(e) {
            pan.setValue(1 - (e.distance / e.size));
        },
        onUp(e) {
            if (e.flickedRight) return close();
            pan.spring(1);
        },
    });

    useEffect(() => {
        if (!animateIn) return;
        if (isVisible) {
            pan.spring(1);
        } else {
            pan.spring(0);
        }
    }, [animateIn, isVisible]);

    useEffect(() => {
        return pan.on(val => {
            const inverse = (1 - val);
            const revealX = (origin.x * inverse);
            const revealY = (origin.y * inverse);

            if (el.current) {
                el.current.style.transform = `translate(${revealX}px, ${revealY}px)`;
                el.current.style.width = toPercent(val);
                el.current.style.height = toPercent(val);
            }
            if (innerEl.current) {
                innerEl.current.style.transform = `translate(${-1 * revealX}px, ${-1 * revealY}px)`;
            }
        });
    }, [width, height]);

    return (
        <div className="layer reveal" ref={el}>
            <div className={c('card reveal-content', className)} ref={innerEl}>
                <ScreenHeader
                    title={title}
                    onClose={close}
                    headerRight={headerRight}
                    presentation="card"
                />
                <div className="card-body" children={children}/>
            </div>
        </div>
    );
});

export const setRevealOrigin = (x, y) => Object.assign(origin, {x, y});
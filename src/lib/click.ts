import { options } from '../common/options';
import report from '../common/report';
import type { BehaviorInfoType } from '../types/global';

export function initClick() {
  if (!options.behavior) return;

  let lastTarget: HTMLElement | null = null;
  let debounceTimer: number | null = null;

  document.addEventListener('click', function (event) {
    // console.log('initClick', event);
    const target = event.target as HTMLElement;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    if (target !== lastTarget) {
      lastTarget = target;
      debounceTimer = setTimeout(() => {
        // 获取点击的元素
        const target = event.target as HTMLElement;
        // 获取元素的计算样式
        const computedStyle = window.getComputedStyle(target);
        // 检查计算样式中是否包含 cursor: pointer
        const cursorStyle = computedStyle.getPropertyValue('cursor');
        if (cursorStyle !== 'pointer') return;

        const reportData = {
          type: 'behavior',
          subType: 'click',
          data: {
            outerHTML: target.outerHTML,
            outerText: target.outerText,
            innerHTML: target.innerHTML,
            innerText: target.innerText,
            x: event.x,
            y: event.y,
            xpath: getXPath(target),
          },
        } as BehaviorInfoType;
        // console.log('initClick', reportData);
        report.lazyReportCache(reportData);
      }, 1000) as unknown as number;
    }
  });
}

function getXPath(element: Element): string {
  if (element === document.documentElement) {
    return '/html';
  }

  let xpath = '';
  const parent = element.parentNode as Element;
  if (parent) {
    let count = 0; // Counter for the number of similar siblings
    let index = 0; // Position of the current element among its siblings
    const siblings = parent.childNodes;

    // Iterate over the siblings of the current element
    // @ts-expect-error
    for (const sibling of siblings) {
      if (sibling.nodeType === 1 && sibling.nodeName.toLowerCase() === element.nodeName.toLowerCase()) {
        count++;
        if (sibling === element) {
          index = count;
        }
      }
    }

    xpath = `${getXPath(parent)}/${element.tagName.toLowerCase()}[${index}]`;
  }
  return xpath;
}

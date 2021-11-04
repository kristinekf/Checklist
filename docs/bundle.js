
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const printable = writable(false);

    /* src\Header.svelte generated by Svelte v3.44.1 */

    const { Map: Map_1 } = globals;
    const file$3 = "src\\Header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (38:4) {:else}
    function create_else_block$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map_1();
    	let each_1_anchor;
    	let each_value = /*titles*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*title*/ ctx[9];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*titles*/ 2) {
    				each_value = /*titles*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block, each_1_anchor, get_each_context);
    			}
    		},
    		i: function intro(local) {
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(38:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#if printMode}
    function create_if_block$3(ctx) {
    	let h30;
    	let t0;
    	let t1;
    	let h31;
    	let t2;
    	let t3;
    	let t4;
    	let h32;
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			t0 = text(/*email*/ ctx[2]);
    			t1 = space();
    			h31 = element("h3");
    			t2 = text("LinkedIn: ");
    			t3 = text(/*linkedin*/ ctx[3]);
    			t4 = space();
    			h32 = element("h3");
    			t5 = text("GitHub: ");
    			t6 = text(/*github*/ ctx[4]);
    			add_location(h30, file$3, 34, 6, 786);
    			add_location(h31, file$3, 35, 6, 810);
    			add_location(h32, file$3, 36, 6, 847);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			append_dev(h30, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h31, anchor);
    			append_dev(h31, t2);
    			append_dev(h31, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, h32, anchor);
    			append_dev(h32, t5);
    			append_dev(h32, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*email*/ 4) set_data_dev(t0, /*email*/ ctx[2]);
    			if (dirty & /*linkedin*/ 8) set_data_dev(t3, /*linkedin*/ ctx[3]);
    			if (dirty & /*github*/ 16) set_data_dev(t6, /*github*/ ctx[4]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(h32);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(34:4) {#if printMode}",
    		ctx
    	});

    	return block;
    }

    // (39:6) {#each titles as title, index (title)}
    function create_each_block(key_1, ctx) {
    	let h3;
    	let t_value = /*title*/ ctx[9] + "";
    	let t;
    	let h3_intro;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			h3 = element("h3");
    			t = text(t_value);
    			add_location(h3, file$3, 39, 8, 941);
    			this.first = h3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*titles*/ 2 && t_value !== (t_value = /*title*/ ctx[9] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!h3_intro) {
    				add_render_callback(() => {
    					h3_intro = create_in_transition(h3, fly, { delay: (/*index*/ ctx[11] + 1) * 300 });
    					h3_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(39:6) {#each titles as title, index (title)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t0;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*printMode*/ ctx[5]) return create_if_block$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			if_block.c();
    			add_location(h1, file$3, 32, 4, 742);
    			attr_dev(div0, "class", "header-text");
    			add_location(div0, file$3, 31, 2, 711);
    			attr_dev(div1, "class", "header");
    			add_location(div1, file$3, 30, 0, 687);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div0, t1);
    			if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { name, titles, email, linkedin, github } = $$props;

    	// https://stackoverflow.com/a/50049255
    	const loaded = new Map();

    	let imageVisible = false;

    	const lazy = (node, data) => {
    		if (loaded.has(data.src)) {
    			node.setAttribute('src', data.src);
    		} else {
    			const img = new Image();
    			img.src = data.src;

    			img.onload = () => {
    				loaded.set(data.src, img);
    				node.setAttribute('src', data.src);
    				imageVisible = true;
    			};
    		}

    		return {
    			destroy() {
    				
    			}, // noop
    			// noop
    			
    		};
    	};

    	let printMode;
    	printable.subscribe(value => $$invalidate(5, printMode = value));
    	const writable_props = ['name', 'titles', 'email', 'linkedin', 'github'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('titles' in $$props) $$invalidate(1, titles = $$props.titles);
    		if ('email' in $$props) $$invalidate(2, email = $$props.email);
    		if ('linkedin' in $$props) $$invalidate(3, linkedin = $$props.linkedin);
    		if ('github' in $$props) $$invalidate(4, github = $$props.github);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		printable,
    		name,
    		titles,
    		email,
    		linkedin,
    		github,
    		loaded,
    		imageVisible,
    		lazy,
    		printMode
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('titles' in $$props) $$invalidate(1, titles = $$props.titles);
    		if ('email' in $$props) $$invalidate(2, email = $$props.email);
    		if ('linkedin' in $$props) $$invalidate(3, linkedin = $$props.linkedin);
    		if ('github' in $$props) $$invalidate(4, github = $$props.github);
    		if ('imageVisible' in $$props) imageVisible = $$props.imageVisible;
    		if ('printMode' in $$props) $$invalidate(5, printMode = $$props.printMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, titles, email, linkedin, github, printMode];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			name: 0,
    			titles: 1,
    			email: 2,
    			linkedin: 3,
    			github: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Header> was created without expected prop 'name'");
    		}

    		if (/*titles*/ ctx[1] === undefined && !('titles' in props)) {
    			console.warn("<Header> was created without expected prop 'titles'");
    		}

    		if (/*email*/ ctx[2] === undefined && !('email' in props)) {
    			console.warn("<Header> was created without expected prop 'email'");
    		}

    		if (/*linkedin*/ ctx[3] === undefined && !('linkedin' in props)) {
    			console.warn("<Header> was created without expected prop 'linkedin'");
    		}

    		if (/*github*/ ctx[4] === undefined && !('github' in props)) {
    			console.warn("<Header> was created without expected prop 'github'");
    		}
    	}

    	get name() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get titles() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set titles(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get email() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get linkedin() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set linkedin(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get github() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set github(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\FooterItem.svelte generated by Svelte v3.44.1 */

    const file$2 = "src\\FooterItem.svelte";

    // (6:2) {#if url && imageSource}
    function create_if_block$2(ctx) {
    	let a;
    	let img;
    	let img_alt_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "class", "footer-img bright");
    			attr_dev(img, "alt", img_alt_value = !!/*altText*/ ctx[2] ? /*altText*/ ctx[2] : '');
    			if (!src_url_equal(img.src, img_src_value = /*imageSource*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 11, 6, 211);
    			attr_dev(a, "rel", "noopener noreferrer");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", /*url*/ ctx[0]);
    			add_location(a, file$2, 6, 4, 120);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*altText*/ 4 && img_alt_value !== (img_alt_value = !!/*altText*/ ctx[2] ? /*altText*/ ctx[2] : '')) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*imageSource*/ 2 && !src_url_equal(img.src, img_src_value = /*imageSource*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*url*/ 1) {
    				attr_dev(a, "href", /*url*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(6:2) {#if url && imageSource}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let h4;
    	let if_block = /*url*/ ctx[0] && /*imageSource*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			if (if_block) if_block.c();
    			attr_dev(h4, "class", "footer-item");
    			add_location(h4, file$2, 4, 0, 62);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			if (if_block) if_block.m(h4, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*url*/ ctx[0] && /*imageSource*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(h4, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FooterItem', slots, []);
    	let { url, imageSource, altText } = $$props;
    	const writable_props = ['url', 'imageSource', 'altText'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FooterItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('imageSource' in $$props) $$invalidate(1, imageSource = $$props.imageSource);
    		if ('altText' in $$props) $$invalidate(2, altText = $$props.altText);
    	};

    	$$self.$capture_state = () => ({ url, imageSource, altText });

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('imageSource' in $$props) $$invalidate(1, imageSource = $$props.imageSource);
    		if ('altText' in $$props) $$invalidate(2, altText = $$props.altText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, imageSource, altText];
    }

    class FooterItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { url: 0, imageSource: 1, altText: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FooterItem",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*url*/ ctx[0] === undefined && !('url' in props)) {
    			console.warn("<FooterItem> was created without expected prop 'url'");
    		}

    		if (/*imageSource*/ ctx[1] === undefined && !('imageSource' in props)) {
    			console.warn("<FooterItem> was created without expected prop 'imageSource'");
    		}

    		if (/*altText*/ ctx[2] === undefined && !('altText' in props)) {
    			console.warn("<FooterItem> was created without expected prop 'altText'");
    		}
    	}

    	get url() {
    		throw new Error("<FooterItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<FooterItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageSource() {
    		throw new Error("<FooterItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageSource(value) {
    		throw new Error("<FooterItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get altText() {
    		throw new Error("<FooterItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set altText(value) {
    		throw new Error("<FooterItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var toggleSelection = function () {
      var selection = document.getSelection();
      if (!selection.rangeCount) {
        return function () {};
      }
      var active = document.activeElement;

      var ranges = [];
      for (var i = 0; i < selection.rangeCount; i++) {
        ranges.push(selection.getRangeAt(i));
      }

      switch (active.tagName.toUpperCase()) { // .toUpperCase handles XHTML
        case 'INPUT':
        case 'TEXTAREA':
          active.blur();
          break;

        default:
          active = null;
          break;
      }

      selection.removeAllRanges();
      return function () {
        selection.type === 'Caret' &&
        selection.removeAllRanges();

        if (!selection.rangeCount) {
          ranges.forEach(function(range) {
            selection.addRange(range);
          });
        }

        active &&
        active.focus();
      };
    };

    var clipboardToIE11Formatting = {
      "text/plain": "Text",
      "text/html": "Url",
      "default": "Text"
    };

    var defaultMessage = "Copy to clipboard: #{key}, Enter";

    function format(message) {
      var copyKey = (/mac os x/i.test(navigator.userAgent) ? "⌘" : "Ctrl") + "+C";
      return message.replace(/#{\s*key\s*}/g, copyKey);
    }

    function copy(text, options) {
      var debug,
        message,
        reselectPrevious,
        range,
        selection,
        mark,
        success = false;
      if (!options) {
        options = {};
      }
      debug = options.debug || false;
      try {
        reselectPrevious = toggleSelection();

        range = document.createRange();
        selection = document.getSelection();

        mark = document.createElement("span");
        mark.textContent = text;
        // reset user styles for span element
        mark.style.all = "unset";
        // prevents scrolling to the end of the page
        mark.style.position = "fixed";
        mark.style.top = 0;
        mark.style.clip = "rect(0, 0, 0, 0)";
        // used to preserve spaces and line breaks
        mark.style.whiteSpace = "pre";
        // do not inherit user-select (it may be `none`)
        mark.style.webkitUserSelect = "text";
        mark.style.MozUserSelect = "text";
        mark.style.msUserSelect = "text";
        mark.style.userSelect = "text";
        mark.addEventListener("copy", function(e) {
          e.stopPropagation();
          if (options.format) {
            e.preventDefault();
            if (typeof e.clipboardData === "undefined") { // IE 11
              debug && console.warn("unable to use e.clipboardData");
              debug && console.warn("trying IE specific stuff");
              window.clipboardData.clearData();
              var format = clipboardToIE11Formatting[options.format] || clipboardToIE11Formatting["default"];
              window.clipboardData.setData(format, text);
            } else { // all other browsers
              e.clipboardData.clearData();
              e.clipboardData.setData(options.format, text);
            }
          }
          if (options.onCopy) {
            e.preventDefault();
            options.onCopy(e.clipboardData);
          }
        });

        document.body.appendChild(mark);

        range.selectNodeContents(mark);
        selection.addRange(range);

        var successful = document.execCommand("copy");
        if (!successful) {
          throw new Error("copy command was unsuccessful");
        }
        success = true;
      } catch (err) {
        debug && console.error("unable to copy using execCommand: ", err);
        debug && console.warn("trying IE specific stuff");
        try {
          window.clipboardData.setData(options.format || "text", text);
          options.onCopy && options.onCopy(window.clipboardData);
          success = true;
        } catch (err) {
          debug && console.error("unable to copy using clipboardData: ", err);
          debug && console.error("falling back to prompt");
          message = format("message" in options ? options.message : defaultMessage);
          window.prompt(message, text);
        }
      } finally {
        if (selection) {
          if (typeof selection.removeRange == "function") {
            selection.removeRange(range);
          } else {
            selection.removeAllRanges();
          }
        }

        if (mark) {
          document.body.removeChild(mark);
        }
        reselectPrevious();
      }

      return success;
    }

    var copyToClipboard = copy;

    /* src\Footer.svelte generated by Svelte v3.44.1 */
    const file$1 = "src\\Footer.svelte";

    // (30:2) {:else}
    function create_else_block(ctx) {
    	let div;
    	let h4;
    	let div_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "email copied to clipboard!";
    			add_location(h4, file$1, 31, 6, 877);
    			attr_dev(div, "class", "footer-container");
    			add_location(div, file$1, 30, 4, 783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*showAndCopyEmail*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, scale, { duration: 100 });
    					div_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(30:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:2) {#if emailHidden}
    function create_if_block$1(ctx) {
    	let div;
    	let h4;
    	let h4_intro;
    	let t1;
    	let img;
    	let img_src_value;
    	let div_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "copy email";
    			t1 = space();
    			img = element("img");
    			add_location(h4, file$1, 22, 6, 618);
    			attr_dev(img, "class", "footer-img tiny-img scale-up");
    			attr_dev(img, "alt", "");
    			if (!src_url_equal(img.src, img_src_value = /*png_click*/ ctx[5])) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 23, 6, 654);
    			attr_dev(div, "class", "footer-container cursor");
    			add_location(div, file$1, 21, 4, 516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*showAndCopyEmail*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (!h4_intro) {
    				add_render_callback(() => {
    					h4_intro = create_in_transition(h4, scale, {});
    					h4_intro.start();
    				});
    			}

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, scale, { duration: 100 });
    					div_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(21:2) {#if emailHidden}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let footeritem0;
    	let t1;
    	let footeritem1;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*emailHidden*/ ctx[2]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	footeritem0 = new FooterItem({
    			props: {
    				url: `https://linkedin.com/in/${/*linkedin*/ ctx[0]}`,
    				imageSource: /*png_linkedin*/ ctx[3],
    				altText: "linkedin"
    			},
    			$$inline: true
    		});

    	footeritem1 = new FooterItem({
    			props: {
    				url: `https://github.com/${/*github*/ ctx[1]}`,
    				imageSource: /*png_github*/ ctx[4],
    				altText: "github"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			create_component(footeritem0.$$.fragment);
    			t1 = space();
    			create_component(footeritem1.$$.fragment);
    			attr_dev(div0, "class", "footer-container");
    			add_location(div0, file$1, 34, 2, 937);
    			attr_dev(div1, "class", "footer");
    			add_location(div1, file$1, 19, 0, 469);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(footeritem0, div0, null);
    			append_dev(div0, t1);
    			mount_component(footeritem1, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t0);
    				}
    			}

    			const footeritem0_changes = {};
    			if (dirty & /*linkedin*/ 1) footeritem0_changes.url = `https://linkedin.com/in/${/*linkedin*/ ctx[0]}`;
    			footeritem0.$set(footeritem0_changes);
    			const footeritem1_changes = {};
    			if (dirty & /*github*/ 2) footeritem1_changes.url = `https://github.com/${/*github*/ ctx[1]}`;
    			footeritem1.$set(footeritem1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(footeritem0.$$.fragment, local);
    			transition_in(footeritem1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footeritem0.$$.fragment, local);
    			transition_out(footeritem1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			destroy_component(footeritem0);
    			destroy_component(footeritem1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	let { email, linkedin, github } = $$props;
    	let png_linkedin = './Images/LI.png';
    	let png_github = './Images/Github.png';
    	let png_click = './Images/cursor.png';
    	let emailHidden = true;

    	const showAndCopyEmail = () => {
    		copyToClipboard(email);
    		$$invalidate(2, emailHidden = false);

    		setTimeout(
    			() => {
    				$$invalidate(2, emailHidden = true);
    			},
    			2000
    		);
    	};

    	const writable_props = ['email', 'linkedin', 'github'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('email' in $$props) $$invalidate(7, email = $$props.email);
    		if ('linkedin' in $$props) $$invalidate(0, linkedin = $$props.linkedin);
    		if ('github' in $$props) $$invalidate(1, github = $$props.github);
    	};

    	$$self.$capture_state = () => ({
    		scale,
    		FooterItem,
    		copy: copyToClipboard,
    		email,
    		linkedin,
    		github,
    		png_linkedin,
    		png_github,
    		png_click,
    		emailHidden,
    		showAndCopyEmail
    	});

    	$$self.$inject_state = $$props => {
    		if ('email' in $$props) $$invalidate(7, email = $$props.email);
    		if ('linkedin' in $$props) $$invalidate(0, linkedin = $$props.linkedin);
    		if ('github' in $$props) $$invalidate(1, github = $$props.github);
    		if ('png_linkedin' in $$props) $$invalidate(3, png_linkedin = $$props.png_linkedin);
    		if ('png_github' in $$props) $$invalidate(4, png_github = $$props.png_github);
    		if ('png_click' in $$props) $$invalidate(5, png_click = $$props.png_click);
    		if ('emailHidden' in $$props) $$invalidate(2, emailHidden = $$props.emailHidden);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		linkedin,
    		github,
    		emailHidden,
    		png_linkedin,
    		png_github,
    		png_click,
    		showAndCopyEmail,
    		email
    	];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { email: 7, linkedin: 0, github: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*email*/ ctx[7] === undefined && !('email' in props)) {
    			console.warn("<Footer> was created without expected prop 'email'");
    		}

    		if (/*linkedin*/ ctx[0] === undefined && !('linkedin' in props)) {
    			console.warn("<Footer> was created without expected prop 'linkedin'");
    		}

    		if (/*github*/ ctx[1] === undefined && !('github' in props)) {
    			console.warn("<Footer> was created without expected prop 'github'");
    		}
    	}

    	get email() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get linkedin() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set linkedin(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get github() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set github(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Cv.svelte generated by Svelte v3.44.1 */
    const file = "src\\Cv.svelte";

    // (34:0) {#if !printMode}
    function create_if_block(ctx) {
    	let footer;
    	let current;

    	footer = new Footer({
    			props: { email, linkedin, github },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:0) {#if !printMode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let header;
    	let t;
    	let if_block_anchor;
    	let current;

    	header = new Header({
    			props: {
    				name: "Tollef Jørgensen",
    				email,
    				linkedin,
    				github,
    				pic: /*profilePic*/ ctx[1],
    				titles: [
    					'PhD Candidate, NTNU, Language Technology (DART group)',
    					'Computer scientist (MSc)'
    				]
    			},
    			$$inline: true
    		});

    	let if_block = !/*printMode*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(header.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "container");
    			toggle_class(div, "printing", /*printMode*/ ctx[0]);
    			add_location(div, file, 19, 0, 493);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(header, div, null);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*printMode*/ 1) {
    				toggle_class(div, "printing", /*printMode*/ ctx[0]);
    			}

    			if (!/*printMode*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*printMode*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(header);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const email = 't@tollef.xyz';
    const linkedin = 'tollefj';
    const github = 'ph10m';

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cv', slots, []);
    	let profilePic = './Images/profile.jpg';
    	let printMode;
    	printable.subscribe(val => $$invalidate(0, printMode = val));
    	const togglePrintmode = () => printable.update(val => !val);
    	window.onbeforeprint = () => togglePrintmode();
    	window.onafterprint = () => togglePrintmode();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cv> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Footer,
    		printable,
    		profilePic,
    		printMode,
    		togglePrintmode,
    		email,
    		linkedin,
    		github
    	});

    	$$self.$inject_state = $$props => {
    		if ('profilePic' in $$props) $$invalidate(1, profilePic = $$props.profilePic);
    		if ('printMode' in $$props) $$invalidate(0, printMode = $$props.printMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [printMode, profilePic];
    }

    class Cv extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cv",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Cv({
      target: document.body,
      props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map

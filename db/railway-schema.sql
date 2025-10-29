--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: editpro-2024
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO "editpro-2024";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: editpro-2024
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO "editpro-2024";

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: editpro-2024
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO "editpro-2024";

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: editpro-2024
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: editpro-2024
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_id character varying(50) NOT NULL,
    partner_id integer,
    status character varying(50) DEFAULT 'Order Created'::character varying,
    created_by character varying(20) DEFAULT 'admin'::character varying,
    delivery_date date,
    delivery_channel character varying(50),
    total_amount numeric(10,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status_changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO "editpro-2024";

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: editpro-2024
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO "editpro-2024";

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: editpro-2024
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: partner_inventory; Type: TABLE; Schema: public; Owner: editpro-2024
--

CREATE TABLE public.partner_inventory (
    id integer NOT NULL,
    partner_id integer,
    product_id integer,
    stock integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.partner_inventory OWNER TO "editpro-2024";

--
-- Name: partner_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: editpro-2024
--

CREATE SEQUENCE public.partner_inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partner_inventory_id_seq OWNER TO "editpro-2024";

--
-- Name: partner_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: editpro-2024
--

ALTER SEQUENCE public.partner_inventory_id_seq OWNED BY public.partner_inventory.id;


--
-- Name: partners; Type: TABLE; Schema: public; Owner: editpro-2024
--

CREATE TABLE public.partners (
    id integer NOT NULL,
    userid character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    partner_type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    partner_name character varying(255),
    email character varying(255),
    phone character varying(50),
    address text,
    CONSTRAINT partners_partner_type_check CHECK (((partner_type)::text = ANY ((ARRAY['admin'::character varying, 'partner'::character varying])::text[])))
);


ALTER TABLE public.partners OWNER TO "editpro-2024";

--
-- Name: products; Type: TABLE; Schema: public; Owner: editpro-2024
--

CREATE TABLE public.products (
    id integer NOT NULL,
    product_name character varying(255) NOT NULL,
    partner_price numeric(10,2) NOT NULL,
    mrp numeric(10,2) NOT NULL,
    current_stock integer DEFAULT 0 NOT NULL,
    pending_orders integer DEFAULT 0 NOT NULL,
    in_circulation integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    pending_units integer DEFAULT 0
);


ALTER TABLE public.products OWNER TO "editpro-2024";

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: editpro-2024
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO "editpro-2024";

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: editpro-2024
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: editpro-2024
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer,
    product_id integer,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sale_items OWNER TO "editpro-2024";

--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: editpro-2024
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_items_id_seq OWNER TO "editpro-2024";

--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: editpro-2024
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: editpro-2024
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    sale_id character varying(255) NOT NULL,
    partner_id integer,
    total_amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_name character varying(255),
    customer_phone character varying(15),
    customer_address text
);


ALTER TABLE public.sales OWNER TO "editpro-2024";

--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: editpro-2024
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO "editpro-2024";

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: editpro-2024
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: editpro-2024
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO "editpro-2024";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: editpro-2024
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.partners.id;


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: partner_inventory id; Type: DEFAULT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.partner_inventory ALTER COLUMN id SET DEFAULT nextval('public.partner_inventory_id_seq'::regclass);


--
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_id_key; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_id_key UNIQUE (order_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: partner_inventory partner_inventory_partner_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.partner_inventory
    ADD CONSTRAINT partner_inventory_partner_id_product_id_key UNIQUE (partner_id, product_id);


--
-- Name: partner_inventory partner_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.partner_inventory
    ADD CONSTRAINT partner_inventory_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sales sales_sale_id_key; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_sale_id_key UNIQUE (sale_id);


--
-- Name: partners users_pkey; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: partners users_userid_key; Type: CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT users_userid_key UNIQUE (userid);


--
-- Name: idx_partner_inventory_partner; Type: INDEX; Schema: public; Owner: editpro-2024
--

CREATE INDEX idx_partner_inventory_partner ON public.partner_inventory USING btree (partner_id);


--
-- Name: idx_partner_inventory_product; Type: INDEX; Schema: public; Owner: editpro-2024
--

CREATE INDEX idx_partner_inventory_product ON public.partner_inventory USING btree (product_id);


--
-- Name: idx_users_userid; Type: INDEX; Schema: public; Owner: editpro-2024
--

CREATE INDEX idx_users_userid ON public.partners USING btree (userid);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id);


--
-- Name: partner_inventory partner_inventory_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.partner_inventory
    ADD CONSTRAINT partner_inventory_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: partner_inventory partner_inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.partner_inventory
    ADD CONSTRAINT partner_inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: sale_items sale_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sales sales_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: editpro-2024
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: editpro-2024
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--


/**
 * Страница каталога. Товары: локальные (catalog.ts) + XML (fetchXmlProducts).
 * Правки названий/цен/картинок — из getPublicProductOverrides (backend/data/product-overrides.json).
 * Можно менять: фильтры, пагинацию, верстку карточек, стили.
 */
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { products as localProducts, collectionCategories, combineProducts, getCollectionDisplayName } from "../data/catalog";
import type { Product } from "../data/catalog";
import { fetchXmlProducts, getPublicProductOverrides } from "../utils/api";
import type { ProductOverrides } from "../utils/api";
import { useCart } from "../context/CartContext";
import Header from "../components/Header/Header";
import { Footer } from "../components/Footer/footer";
import styles from "./CatalogPage.module.scss";

import tumbyIcon from "../assets/tumby_icon.png";
import komodyIcon from "../assets/komody_icon.png";
import stolyIcon from "../assets/stoly_icon.png";
import stulyaIcon from "../assets/stulya_icon.png";
import konsoliIcon from "../assets/konsoli_icon.png";
import vitrinyIcon from "../assets/vitriny_icon.png";
import allIcon from "../assets/all_icon.png";
import krovatiIcon from "../assets/krovati_icon.png";
import zerkalaIcon from "../assets/zerkala_icon.png";
import taburetyIcon from "../assets/taburety_icon.png";
import banketkiIcon from "../assets/banketki_icon.png";
import stelazhiIcon from "../assets/stelazhi_icon.png";
import divaniIcon from "../assets/divani_icon.png";
import poufiIcon from "../assets/poufi_icon.png";
import otherIcon from "../assets/other_icon.png";
import PhoneButton from "../components/PhoneButton/phone-button";
import { usePageMeta } from "../utils/seo";

const FilterIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronLeft = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const getCategoryIcon = (categoryId: string): string => {
  const imageIcons: { [key: string]: string } = {
    tumby: tumbyIcon,
    komody: komodyIcon,
    stoly: stolyIcon,
    stulya: stulyaIcon,
    "taburety-i-stulya": taburetyIcon,
    konsoli: konsoliIcon,
    vitriny: vitrinyIcon,
    shkafy: vitrinyIcon,
    all: allIcon,
    krovati: krovatiIcon,
    zerkala: zerkalaIcon,
    taburety: taburetyIcon,
    banketki: banketkiIcon,
    stelazhi: stelazhiIcon,
    divani: divaniIcon,
    poufi: poufiIcon,
    other: otherIcon,
  };

  if (imageIcons[categoryId]) {
    return imageIcons[categoryId];
  }
  return allIcon;
};

const parsePrice = (priceStr: string): number => {
  return parseInt(priceStr.replace(/\D/g, ""), 10) || 0;
};

const ITEMS_PER_PAGE = 20;

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  usePageMeta('Каталог товаров', 'Каталог мебели СВОБОДА: все коллекции и категории. Bryce, Soho, Art Deco, Sydney, Gven, столовые группы.');

  const [xmlProducts, setXmlProducts] = useState<Product[]>([]);
  const [, setLoadingXml] = useState(true);
  const [overrides, setOverrides] = useState<ProductOverrides>({});

  const products = useMemo(() => {
    return combineProducts(localProducts, xmlProducts);
  }, [xmlProducts]);

  useEffect(() => {
    const loadXmlProducts = async () => {
      try {
        setLoadingXml(true);
        const xmlData = await fetchXmlProducts();
        setXmlProducts(xmlData);
      } catch (error) {
        console.error('Ошибка загрузки XML продуктов:', error);
      } finally {
        setLoadingXml(false);
      }
    };

    loadXmlProducts();
  }, []);

  useEffect(() => {
    getPublicProductOverrides().then(setOverrides);
  }, []);

  const [selectedCollections, setSelectedCollections] = useState<string[]>(() =>
    searchParams.getAll("collection"),
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    searchParams.getAll("category"),
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(() =>
    searchParams.getAll("material"),
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || "",
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() =>
    parseInt(searchParams.get("page") || "1", 10),
  );

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const min = searchParams.get("minPrice");
    const max = searchParams.get("maxPrice");
    return min && max ? [parseInt(min), parseInt(max)] : [0, 1000000];
  });

  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map((p) => parsePrice(p.price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setMinPrice(min);
      setMaxPrice(max);

      const urlMin = searchParams.get("minPrice");
      const urlMax = searchParams.get("maxPrice");
      if (!urlMin || !urlMax) {
        setPriceRange([min, max]);
      }
    }
  }, [products, searchParams]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach((p) => categories.add(p.category));
    return Array.from(categories).sort();
  }, [products]);

  const allCollections = useMemo(() => {
    const cols = new Set<string>();
    products.forEach((p) => cols.add(p.collection));
    const getSortGroup = (value: string) => {
      const v = value.trim();
      if (/^[A-Za-z]/.test(v)) return 0;
      if (/^[А-Яа-яЁё]/.test(v)) return 1;
      return 2;
    };

    const compare = (a: string, b: string) => {
      const aName = getCollectionDisplayName(a);
      const bName = getCollectionDisplayName(b);
      const aGroup = getSortGroup(aName);
      const bGroup = getSortGroup(bName);
      if (aGroup !== bGroup) return aGroup - bGroup;
      const locale = aGroup === 0 ? 'en' : aGroup === 1 ? 'ru' : undefined;
      return aName.localeCompare(bName, locale, { sensitivity: 'base' });
    };

    return Array.from(cols).sort(compare);
  }, [products]);

  const allMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach((p) => {
      if (p.specs?.material) {
        p.specs.material.split(",").forEach((m) => {
          const cleanMat = m.trim();
          if (cleanMat) materials.add(cleanMat);
        });
      }
    });
    return Array.from(materials).sort();
  }, [products]);

  const getCategoryNameRu = (catId: string) => {
    if (catId === 'other') return 'Другое';
    if (catId === 'vitriny' || catId === 'shkafy') return 'Витрины / Шкафы';
    if (catId === 'divani') return 'Диваны';
    if (catId === 'poufi') return 'Пуфы';
    for (const colId in collectionCategories) {
      const category = collectionCategories[colId].find((c) => c.id === catId);
      if (category) return category.nameRu;
    }
    return catId.charAt(0).toUpperCase() + catId.slice(1).replace(/-/g, " ");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCollection =
        selectedCollections.length === 0 ||
        selectedCollections.includes(product.collection);
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const matchSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.article &&
          product.article.toLowerCase().includes(searchQuery.toLowerCase()));

      const price = parsePrice(product.price);
      const matchPrice = price >= priceRange[0] && price <= priceRange[1];

      let matchMaterial = true;
      if (selectedMaterials.length > 0) {
        if (!product.specs?.material) {
          matchMaterial = false;
        } else {
          const productMaterials = product.specs.material
            .split(",")
            .map((m) => m.trim());

          matchMaterial = selectedMaterials.some((m) =>
            productMaterials.includes(m),
          );
        }
      }

      return (
        matchCollection &&
        matchCategory &&
        matchSearch &&
        matchPrice &&
        matchMaterial
      );
    });
  }, [
    products,
    selectedCollections,
    selectedCategories,
    selectedMaterials,
    searchQuery,
    priceRange,
  ]);

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      setCurrentPage(1);
    } else {
      isMounted.current = true;
    }
  }, [
    selectedCollections,
    selectedCategories,
    selectedMaterials,
    searchQuery,
    priceRange,
  ]);

  useEffect(() => {
    const params = new URLSearchParams();
    selectedCollections.forEach((c) => params.append("collection", c));
    selectedCategories.forEach((c) => params.append("category", c));
    selectedMaterials.forEach((m) => params.append("material", m));
    if (searchQuery) params.set("q", searchQuery);
    if (currentPage > 1) params.set("page", currentPage.toString());

    params.set("minPrice", priceRange[0].toString());
    params.set("maxPrice", priceRange[1].toString());

    setSearchParams(params, { replace: true });
  }, [
    selectedCollections,
    selectedCategories,
    selectedMaterials,
    searchQuery,
    priceRange,
    currentPage,
    setSearchParams,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const toggleCollection = (collection: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((c) => c !== collection)
        : [...prev, collection],
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material],
    );
  };

  const handleProductClick = (uid: string) => {
    navigate(`/product/${uid}`);
  };

  const handlePriceChange = (index: 0 | 1, value: string) => {
    const val = parseInt(value, 10) || 0;
    const newRange = [...priceRange] as [number, number];
    newRange[index] = val;
    setPriceRange(newRange);
  };

  const handleSliderChange = (index: 0 | 1, value: string) => {
    const val = parseInt(value, 10);
    const newRange = [...priceRange] as [number, number];
    newRange[index] = val;

    if (index === 0 && val > newRange[1]) newRange[0] = newRange[1];
    if (index === 1 && val < newRange[0]) newRange[1] = newRange[0];

    setPriceRange(newRange);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPercent = (value: number) => {
    if (maxPrice === minPrice) return 0;
    return Math.round(((value - minPrice) / (maxPrice - minPrice)) * 100);
  };

  const viewKey = useMemo(() => {
    return [
      currentPage,
      selectedCollections.join(","),
      selectedCategories.join(","),
      selectedMaterials.join(","),
      searchQuery,
      priceRange.join(","),
    ].join("|");
  }, [
    currentPage,
    selectedCollections,
    selectedCategories,
    selectedMaterials,
    searchQuery,
    priceRange,
  ]);

  return (
    <div className={styles.catalogPage}>
      <Header />

      <div
        className={`${styles.mobileFilterOverlay} ${isMobileFiltersOpen ? styles.open : ""}`}
        onClick={() => setIsMobileFiltersOpen(false)}
      />

      <div className={styles.catalogContainer}>
        <aside
          className={`${styles.filtersSidebar} ${isMobileFiltersOpen ? styles.open : ""}`}
        >
          <button
            className={styles.closeFilterButton}
            onClick={() => setIsMobileFiltersOpen(false)}
            aria-label="Закрыть фильтры"
          >
            <CloseIcon />
          </button>

          <div className={styles.sidebarContent}>
            <div className={styles.searchSection}>
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterSection}>
              <h3>Коллекции</h3>
              <div className={styles.collectionPickers}>
                {allCollections.map((collection) => (
                  <button
                    key={collection}
                    className={`${styles.collectionPicker} ${selectedCollections.includes(collection) ? styles.active : ""}`}
                    onClick={() => toggleCollection(collection)}
                  >
                    {getCollectionDisplayName(collection)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h3>Категории</h3>
              <div className={styles.categoryList}>
                {allCategories.map((category) => (
                  <button
                    key={category}
                    className={`${styles.categoryItem} ${selectedCategories.includes(category) ? styles.active : ""}`}
                    onClick={() => toggleCategory(category)}
                  >
                    <div className={styles.categoryIcon}>
                      <img
                        src={getCategoryIcon(category)}
                        alt={category}
                        loading="lazy"
                      />
                    </div>
                    <span>{getCategoryNameRu(category)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h3>Материалы</h3>
              <div className={styles.collectionPickers}>
                {" "}
                {allMaterials.map((material) => (
                  <button
                    key={material}
                    className={`${styles.collectionPicker} ${selectedMaterials.includes(material) ? styles.active : ""}`}
                    onClick={() => toggleMaterial(material)}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h3>Цена</h3>
              <div className={styles.priceFilter}>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(0, e.target.value)}
                    min={minPrice}
                    max={maxPrice}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(1, e.target.value)}
                    min={minPrice}
                    max={maxPrice}
                  />
                </div>
                <div className={styles.rangeSlider}>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => handleSliderChange(0, e.target.value)}
                    className={styles.thumb}
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => handleSliderChange(1, e.target.value)}
                    className={styles.thumb}
                  />
                  <div className={styles.sliderTrack}></div>
                  <div
                    className={styles.sliderRange}
                    style={{
                      left: `${getPercent(priceRange[0])}%`,
                      width: `${getPercent(priceRange[1]) - getPercent(priceRange[0])}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.productsGridSection}>
          <div className={styles.productsHeader}>
            <h1>
              Все<span>Товары</span>{" "}
              <span className={styles.productsCount}>
                {filteredProducts.length}
              </span>
            </h1>
          </div>

          <div className={styles.grid} key={viewKey}>
            {paginatedProducts.map((product) => {
              const productUid = product.uid || `${product.collection}-${product.id}`;
              const o = overrides[productUid];
              const displayName = o?.name ?? product.name;
              const basePrice = o?.price ?? product.price;
              const displayImage = o?.image ?? product.image;
              const isSale = !!o?.isSale && !!o?.salePrice;
              const displayPrice = isSale ? (o!.salePrice!) : basePrice;
              const priceNum = parsePrice(displayPrice);
              return (
                <div
                  key={productUid}
                  className={styles.productCard}
                  onClick={() => handleProductClick(productUid)}
                >
                  <div className={styles.productImage}>
                    <img src={displayImage} alt={displayName} loading="lazy" />
                    {isSale && <span className={styles.saleBadge}>Акция</span>}
                    <span className={styles.collectionTag}>
                      {getCollectionDisplayName(product.collection)}
                    </span>
                  </div>
                  <div className={styles.productInfo}>
                    {product.article && (
                      <p className={styles.productArticle}>
                        Арт: {product.article}
                      </p>
                    )}
                    <h3 className={styles.productName}>{displayName}</h3>
                    <p className={styles.productPrice}>
                      {isSale ? (
                        <>
                          <span className={styles.oldPrice}>{basePrice}</span>{' '}
                          <span className={styles.salePrice}>{displayPrice}</span>
                        </>
                      ) : (
                        displayPrice
                      )}
                    </p>
                    <button
                      type="button"
                      className={styles.buyButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({
                          productUid,
                          name: displayName,
                          price: displayPrice,
                          priceNum,
                          image: displayImage,
                          quantity: 1,
                          article: product.article,
                        });
                      }}
                    >
                      Купить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 ? (
            <div className={styles.noResults}>
              <h3>Нет товаров, соответствующих выбранным фильтрам</h3>
              <button
                onClick={() => {
                  setSelectedCollections([]);
                  setSelectedCategories([]);
                  setSelectedMaterials([]);
                  setSearchQuery("");
                  setPriceRange([minPrice, maxPrice]);
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                >
                  <ChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1 ? (
                      <button
                        key={page}
                        className={currentPage === page ? styles.active : ""}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ) : (
                      (page === currentPage - 2 ||
                        page === currentPage + 2) && (
                        <span key={page} style={{ color: "white" }}>
                          ...
                        </span>
                      )
                    ),
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next Page"
                >
                  <ChevronRight />
                </button>
              </div>
            )
          )}
        </main>
      </div>

      <button
        className={styles.filterButton}
        onClick={() => setIsMobileFiltersOpen(true)}
        aria-label="Фильтры"
      >
        <FilterIcon />
      </button>

      <PhoneButton position="right" />

      <Footer />
    </div>
  );
};

export default CatalogPage;

/**
 * Список коллекций. Товары: локальные + XML. Можно менять тексты в массиве collections,
 * добавлять новые коллекции. Иконки категорий — src/assets/*_icon.png.
 */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CollectionsPage.module.scss";
import {
  collectionCategories,
  collections as localCollectionsData,
  products as localProducts,
  combineProducts,
} from "../data/catalog";
import { fetchXmlProducts } from "../utils/api";
import type { Product } from "../data/catalog";
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
import { Link } from "react-router-dom";
import { usePageMeta } from "../utils/seo";

const normalizeCollectionImageKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/&/g, "and")
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const collectionImageModules = import.meta.glob(
  "../assets/collections/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

const collectionMainImageByKey: Record<string, string> = Object.fromEntries(
  Object.entries(collectionImageModules).flatMap(([path, url]) => {
    const fileName = path.split("/").pop() || "";
    const baseName = fileName.replace(/\.(png|jpg|jpeg|webp)$/i, "");
    const key = normalizeCollectionImageKey(baseName);
    const keyNoDashes = key.replace(/-/g, "");
    return [
      [key, url],
      [keyNoDashes, url],
    ];
  }),
);

const getCollectionMainImage = (...candidates: Array<string | undefined>) => {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const key = normalizeCollectionImageKey(candidate);
    if (collectionMainImageByKey[key]) return collectionMainImageByKey[key];
    const keyNoDashes = key.replace(/-/g, "");
    if (collectionMainImageByKey[keyNoDashes])
      return collectionMainImageByKey[keyNoDashes];
  }
  return undefined;
};

const DEFAULT_COLLECTION_IMAGE = getCollectionMainImage("bryce") || "";

const collections = [
  {
    id: "bryce",
    name: "Bryce",
    russianName: "Естественность и элегантность",
    description:
      "Коллекция Bryce с фрезерованными фасадами стала одним из самых модных трендов этого года, который будет сохраняться еще долгое время. Изделия выглядят очень естественно, элегантно и подходят под любой современный стиль.",
    image: getCollectionMainImage("bryce", "Bryce") || DEFAULT_COLLECTION_IMAGE,
  },
  {
    id: "soho",
    name: "Soho",
    russianName: "Европейский контемпорари",
    description:
      "Изделия коллекции SOHO отлично впишутся в любой интерьер, так как используемый стиль контемпорари объединяет европейскую элегантность и скандинавскую ясность форм.",
    image: getCollectionMainImage("soho", "Soho") || DEFAULT_COLLECTION_IMAGE,
  },
  {
    id: "art-deco",
    name: "Art Deco",
    russianName: "Экзотический модерн",
    description:
      "Стиль, возникший в Европе и США в начале XX века, объединяющий элементы модерна, классики и экзотики. Он славится: геометрическими формами, богатыми декоративными деталями, использованием дорогих материалов, элегантностью и симметрией.",
    image:
      getCollectionMainImage("artdeco", "art-deco", "Art Deco") ||
      DEFAULT_COLLECTION_IMAGE,
  },
  {
    id: "sydney",
    name: "Sydney",
    russianName: "Графитовый лофт",
    description:
      "Коллекция Sydney выполнена из натурального массива дуба. Изделия отличаются интересным сочетанием латунной фурнитуры с темно-графитовым цветом основания, что создает благородный и при этом современный стильный дизайн.",
    image:
      getCollectionMainImage("sydney", "Sydney") || DEFAULT_COLLECTION_IMAGE,
  },
  {
    id: "gven",
    name: "Gven",
    russianName: "Минимализм и долговечность",
    description:
      "Стиль минимализм и натуральное дерево идеально гармонируют в Коллекции Gven. Использование МДФ и шпона дуба обеспечивает долговечность и эстетическую привлекательность, а ножки из массива дуба добавляют прочности и стабильности.",
    image: getCollectionMainImage("gven", "Gven") || DEFAULT_COLLECTION_IMAGE,
  },
  {
    id: "dining-groups",
    name: "Dining Groups",
    russianName: "Столовые группы",
    description:
      "Элегантные столы и стулья для создания уютной столовой зоны. Идеальное сочетание комфорта и стиля для семейных обедов и встреч с друзьями.",
    image:
      getCollectionMainImage("dining-groups", "Dining Groups") ||
      DEFAULT_COLLECTION_IMAGE,
  },
];

const categoryNamesRu: { [key: string]: string } = {
  tumby: "Тумбы",
  komody: "Комоды",
  stoly: "Столы",
  stulya: "Стулья",
  taburety: "Табуреты",
  konsoli: "Консоли",
  vitriny: "Витрины / Шкафы",
  shkafy: "Витрины / Шкафы",
  divani: "Диваны",
  poufi: "Пуфы",
  all: "Все категории",
  krovati: "Кровати",
  zerkala: "Зеркала",
  banketki: "Банкетки",
  stelazhi: "Стелажи",
  other: "Другое",
};

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
  return allIcon; // Fallback иконка
};

const CollectionsPage: React.FC = () => {
  usePageMeta(
    "Коллекции",
    "Коллекции мебели СВОБОДА: Bryce, Soho, Art Deco, Sydney, Gven, столовые группы. Каталог по категориям.",
  );
  const [xmlProducts, setXmlProducts] = useState<Product[]>([]);
  const [, setLoadingXml] = useState(true);

  const allProducts = useMemo(() => {
    return combineProducts(localProducts, xmlProducts);
  }, [xmlProducts]);

  useEffect(() => {
    const loadXmlProducts = async () => {
      try {
        setLoadingXml(true);
        const xmlData = await fetchXmlProducts();
        setXmlProducts(xmlData);
      } catch (error) {
        console.error("Ошибка загрузки XML продуктов:", error);
      } finally {
        setLoadingXml(false);
      }
    };

    loadXmlProducts();
  }, []);

  const allCollectionsList = useMemo(() => {
    const getSortGroup = (value: string) => {
      const v = value.trim();
      if (/^[A-Za-z]/.test(v)) return 0;
      if (/^[А-Яа-яЁё]/.test(v)) return 1;
      return 2;
    };

    const compareCollections = (
      a: { name: string; russianName: string },
      b: { name: string; russianName: string },
    ) => {
      const aKey = (a.name || "").trim();
      const bKey = (b.name || "").trim();
      const aGroup = getSortGroup(aKey);
      const bGroup = getSortGroup(bKey);
      if (aGroup !== bGroup) return aGroup - bGroup;
      const locale = aGroup === 0 ? "en" : aGroup === 1 ? "ru" : undefined;
      const byName = aKey.localeCompare(bKey, locale, { sensitivity: "base" });
      if (byName !== 0) return byName;
      return (a.russianName || "").localeCompare(b.russianName || "", "ru", {
        sensitivity: "base",
      });
    };

    const collectionsSet = new Set<string>();
    allProducts.forEach((product) => {
      collectionsSet.add(product.collection);
    });

    const dynamicCollections = Array.from(collectionsSet).map(
      (collectionId) => {
        const localCollection = localCollectionsData[collectionId];
        const id = collectionId.toLowerCase().replace(/\s+/g, "-");
        const collectionProducts = allProducts.filter(
          (p) => p.collection === collectionId,
        );
        const firstProduct = collectionProducts[0];
        const name = localCollection
          ? localCollection.name
          : collectionId.charAt(0).toUpperCase() +
            collectionId.slice(1).replace(/-/g, " ");

        const image =
          getCollectionMainImage(name, collectionId, id) ||
          firstProduct?.image ||
          DEFAULT_COLLECTION_IMAGE;

        if (localCollection) {
          return {
            id,
            name: localCollection.name,
            russianName: localCollection.russianName,
            description: localCollection.description,
            image,
            isLocal: true,
          };
        }

        return {
          id,
          name,
          russianName: collectionId.replace(/-/g, " "),
          description: `Коллекция ${collectionId.replace(/-/g, " ")}. ${collectionProducts.length} товаров.`,
          image,
          isLocal: false,
          productCount: collectionProducts.length,
        };
      },
    );

    if (xmlProducts.length > 0) {
      return [...dynamicCollections].sort(compareCollections);
    }

    const localCollectionIds = new Set(collections.map((c) => c.id));
    const mergedCollections = [...collections];

    dynamicCollections.forEach((dynamicCol) => {
      if (!localCollectionIds.has(dynamicCol.id)) {
        mergedCollections.push(dynamicCol);
      }
    });

    return [...mergedCollections].sort(compareCollections);
  }, [allProducts, xmlProducts]);

  const collectionsToShow =
    allCollectionsList.length > 0 ? allCollectionsList : collections;

  const getCollectionCategories = (collectionId: string) => {
    const collection = collectionsToShow.find((c) => c.id === collectionId);
    if (!collection) return [];

    const collectionName = collection.name.toLowerCase().replace(/\s+/g, "-");
    const collectionNameWithSpaces = collection.name.toLowerCase();

    if (
      collectionCategories[collectionName] ||
      collectionCategories[collectionNameWithSpaces]
    ) {
      return (
        collectionCategories[collectionName] ||
        collectionCategories[collectionNameWithSpaces] ||
        []
      );
    }

    const collectionProducts = allProducts.filter((p) => {
      const pCollectionId = p.collection.toLowerCase().replace(/\s+/g, "-");
      const pCollectionName = p.collection.toLowerCase();
      return (
        pCollectionId === collectionId ||
        pCollectionName === collectionNameWithSpaces ||
        pCollectionId === collectionName
      );
    });

    const uniqueCategories = new Set<string>();
    collectionProducts.forEach((product) => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });

    return Array.from(uniqueCategories)
      .map((catId) => ({
        id: catId,
        name: catId,
        nameRu:
          categoryNamesRu[catId] ||
          catId.charAt(0).toUpperCase() + catId.slice(1),
      }))
      .sort((a, b) => {
        if (a.id === "other") return 1;
        if (b.id === "other") return -1;
        return a.nameRu.localeCompare(b.nameRu);
      });
  };

  const [selectedCollection, setSelectedCollection] = useState(
    collectionsToShow[0] || collections[0],
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCollectionsMenu, setShowCollectionsMenu] = useState(true);
  const [collectionsSlideIndex, setCollectionsSlideIndex] = useState(0);
  const [collectionsMenuItemHeight, setCollectionsMenuItemHeight] = useState<
    number | null
  >(null);
  const collectionsNavRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  const collectionsItemsPerSlide = useMemo(() => {
    if (viewportWidth <= 480) return 4;
    if (viewportWidth <= 768) return 4;
    if (viewportWidth <= 1024) return 6;
    return 8;
  }, [viewportWidth]);

  const collectionsGridColumns = useMemo(() => {
    if (collectionsItemsPerSlide >= 8) return 4;
    if (collectionsItemsPerSlide >= 6) return 3;
    return 2;
  }, [collectionsItemsPerSlide]);

  const collectionsSlides = useMemo(() => {
    const result: Array<(typeof collectionsToShow)[number][]> = [];
    for (let i = 0; i < collectionsToShow.length; i += collectionsItemsPerSlide) {
      result.push(collectionsToShow.slice(i, i + collectionsItemsPerSlide));
    }
    return result;
  }, [collectionsToShow, collectionsItemsPerSlide]);

  const collectionsSlidesCount = collectionsSlides.length;

  useLayoutEffect(() => {
    if (!showCollectionsMenu || showCategoryPicker) return;
    const nav = collectionsNavRef.current;
    if (!nav) return;

    setCollectionsMenuItemHeight(null);

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        const items = Array.from(nav.querySelectorAll<HTMLElement>(`.${styles.menuItem}`));
        let maxHeight = 0;
        for (const el of items) {
          const h = el.getBoundingClientRect().height;
          if (h > maxHeight) maxHeight = h;
        }
        if (maxHeight > 0) {
          setCollectionsMenuItemHeight(Math.ceil(maxHeight));
        }
      });
    });

    return () => {
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [
    showCollectionsMenu,
    showCategoryPicker,
    viewportWidth,
    collectionsGridColumns,
    collectionsSlideIndex,
    collectionsItemsPerSlide,
    collectionsToShow.length,
  ]);

  useEffect(() => {
    if (
      collectionsToShow.length > 0 &&
      (!selectedCollection ||
        !collectionsToShow.find((c) => c.id === selectedCollection.id))
    ) {
      setSelectedCollection(collectionsToShow[0]);
    }
  }, [collectionsToShow]);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width <= 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (collectionsSlidesCount === 0) {
      setCollectionsSlideIndex(0);
      return;
    }

    setCollectionsSlideIndex((current) =>
      Math.min(current, collectionsSlidesCount - 1),
    );
  }, [collectionsSlidesCount]);

  useEffect(() => {
    const selectedIndex = collectionsToShow.findIndex(
      (c) => c.id === selectedCollection.id,
    );
    if (selectedIndex < 0) return;

    const desiredSlide = Math.floor(selectedIndex / collectionsItemsPerSlide);
    if (desiredSlide === collectionsSlideIndex) return;
    if (desiredSlide >= collectionsSlidesCount) return;

    setCollectionsSlideIndex(desiredSlide);
  }, [
    collectionsToShow,
    selectedCollection,
    collectionsItemsPerSlide,
    collectionsSlideIndex,
    collectionsSlidesCount,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!isMobile || showCategoryPicker) return;

    const interval = setInterval(() => {
      setSelectedCollection((current) => {
        const availableCollections =
          collectionsSlides[collectionsSlideIndex] || collectionsToShow;
        const currentIndex = availableCollections.findIndex(
          (col) => col.id === current.id,
        );
        const nextIndex = (currentIndex + 1) % availableCollections.length;
        return availableCollections[nextIndex] || availableCollections[0];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [
    isMobile,
    showCategoryPicker,
    collectionsToShow,
    collectionsSlides,
    collectionsSlideIndex,
  ]);

  const handleCollectionSelect = (
    collection: (typeof allCollectionsList)[0],
  ) => {
    setSelectedCollection(collection);
    setSelectedCategory("");
  };

  const handleCollectionClick = (
    collection: (typeof allCollectionsList)[0],
  ) => {
    setSelectedCollection(collection);
    setSelectedCategory("");

    setShowCollectionsMenu(false);
    setTimeout(() => {
      setShowCategoryPicker(true);
    }, 300);
  };

  const handleGoToCollection = (
    collection: (typeof allCollectionsList)[0],
    category?: string,
  ) => {
    const collectionName = collection.name.toLowerCase().replace(/\s+/g, "-");

    const categoryToUse = category !== undefined ? category : selectedCategory;

    const categoryParam =
      categoryToUse && categoryToUse !== "all"
        ? `?category=${categoryToUse}`
        : "";
    console.log(
      "Navigating to:",
      `/collections/${collectionName}${categoryParam}`,
      "Collection:",
      collection.name,
      "Category:",
      categoryToUse,
    );
    navigate(`/collections/${collectionName}${categoryParam}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    console.log(
      "Category changed to:",
      categoryId,
      "Current collection:",
      selectedCollection.name,
    );
    setSelectedCategory(categoryId);

    setTimeout(() => {
      handleGoToCollection(selectedCollection, categoryId);
    }, 200);
  };

  const handleBackToCollections = () => {
    setShowCategoryPicker(false);
    setTimeout(() => {
      setShowCollectionsMenu(true);
    }, 300);
  };

  const visibleCollections = collectionsSlides[collectionsSlideIndex] || [];

  const handlePrevCollectionsSlide = () => {
    if (collectionsSlidesCount <= 1) return;
    setCollectionsSlideIndex((current) => {
      const nextIndex =
        (current - 1 + collectionsSlidesCount) % collectionsSlidesCount;
      const nextSlide = collectionsSlides[nextIndex];
      if (nextSlide && nextSlide.length > 0) {
        setSelectedCollection(nextSlide[0]);
        setSelectedCategory("");
      }
      return nextIndex;
    });
  };

  const handleNextCollectionsSlide = () => {
    if (collectionsSlidesCount <= 1) return;
    setCollectionsSlideIndex((current) => {
      const nextIndex = (current + 1) % collectionsSlidesCount;
      const nextSlide = collectionsSlides[nextIndex];
      if (nextSlide && nextSlide.length > 0) {
        setSelectedCollection(nextSlide[0]);
        setSelectedCategory("");
      }
      return nextIndex;
    });
  };

  return (
    <div
      className={`${styles.collectionsPage} ${isLoaded ? styles.loaded : ""}`}
    >
      <div className={styles.collectionsContainer}>
        <div className={`${styles.collectionPreview} ${styles.fadeInLeft}`}>
          <div
            className={styles.previewBackground}
            style={{ backgroundImage: `url(${selectedCollection.image})` }}
          >
            <div className={styles.previewOverlay}>
              <header className={styles.collectionsHeader}>
                <Link to="/">
                  <img
                    src="/SVOBODA_LOGO_WHITE.png"
                    alt=""
                    className={styles.headerLogo}
                  />
                </Link>
              </header>
              <div className={styles.previewContent}>
                <div className={styles.magazineLayout}>
                  <div
                    className={`${styles.collectionNumber} ${styles.fadeInUp}`}
                  >
                    {String(
                      collectionsToShow.findIndex(
                        (c) => c.id === selectedCollection.id,
                      ) + 1,
                    ).padStart(2, "0")}
                  </div>
                  <div className={styles.collectionInfo}>
                    <h2
                      className={`${styles.previewTitle} ${styles.fadeInUp}`}
                      style={{ animationDelay: "0.2s" }}
                    >
                      <span className={styles.titleMain}>
                        {selectedCollection.name}
                      </span>
                      <span className={styles.titleSub}>
                        {selectedCollection.russianName}
                      </span>
                    </h2>
                    <div
                      className={`${styles.descriptionWrapper} ${styles.fadeInUp}`}
                      style={{ animationDelay: "0.4s" }}
                    >
                      <p className={styles.previewDescription}>
                        {selectedCollection.description}
                      </p>
                      <div className={styles.collectionMeta}>
                        <span className={styles.collectionYear}>2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.collectionsMenu} ${styles.fadeInRight}`}>
          <div
            className={`${styles.menuHeader} ${styles.fadeInUp}`}
            style={{ animationDelay: "0.1s" }}
          >
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h1 className={styles.menuTitle}>
                  {showCategoryPicker
                    ? `${selectedCollection.name}`
                    : "Коллекции"}
                </h1>
                <p className={styles.menuSubtitle}>
                  {showCategoryPicker
                    ? "Выберите категорию для просмотра"
                    : "Выберите коллекцию для просмотра"}
                </p>
              </div>
              {showCategoryPicker ? (
                <button
                  className={`${styles.categoryButton} ${styles.backButton}`}
                  onClick={handleBackToCollections}
                >
                  ← Назад к коллекциям
                </button>
              ) : (
                <button
                  className={`${styles.categoryButton} ${styles.backButton}`}
                  onClick={() => navigate("/")}
                >
                  ← На главную
                </button>
              )}
            </div>
          </div>
          {showCollectionsMenu && (
            <div className={`${styles.collectionsList} ${styles.fadeIn}`}>
              <div className={styles.collectionsSlider}>
                {collectionsSlidesCount > 1 && (
                  <button
                    type="button"
                    className={`${styles.collectionsSliderArrow} ${styles.collectionsSliderArrowLeft}`}
                    onClick={handlePrevCollectionsSlide}
                    aria-label="Предыдущие коллекции"
                  >
                    ←
                  </button>
                )}
                <nav
                  ref={collectionsNavRef}
                  className={`${styles.menuNav} ${styles.menuNavSlider}`}
                  style={
                    {
                      ["--collections-columns" as string]:
                        collectionsGridColumns,
                      ...(collectionsMenuItemHeight
                        ? {
                            ["--collections-menu-item-height" as string]:
                              `${collectionsMenuItemHeight}px`,
                          }
                        : {}),
                    } as React.CSSProperties
                  }
                >
                  {visibleCollections.map((collection, index) => (
                    <button
                      key={collection.id}
                      className={`${styles.menuItem} ${styles.fadeInUp} ${selectedCollection.id === collection.id ? styles.menuItemActive : ""}`}
                      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                      onClick={() => handleCollectionClick(collection)}
                      onMouseEnter={() =>
                        !isMobile && handleCollectionSelect(collection)
                      }
                    >
                      <div className={styles.menuItemContent}>
                        <h3 className={styles.menuItemTitle}>
                          {collection.name}
                        </h3>
                      </div>
                      <div className={styles.menuItemArrow}>→</div>
                    </button>
                  ))}
                </nav>
                {collectionsSlidesCount > 1 && (
                  <button
                    type="button"
                    className={`${styles.collectionsSliderArrow} ${styles.collectionsSliderArrowRight}`}
                    onClick={handleNextCollectionsSlide}
                    aria-label="Следующие коллекции"
                  >
                    →
                  </button>
                )}
              </div>
              {collectionsSlidesCount > 1 && (
                <div className={styles.collectionsSliderPagination}>
                  {collectionsSlideIndex + 1} / {collectionsSlidesCount}
                </div>
              )}
            </div>
          )}
          {showCategoryPicker &&
            (() => {
              const currentCategories = getCollectionCategories(
                selectedCollection.id,
              );
              return (
                <div className={`${styles.categorySelector} ${styles.fadeIn}`}>
                  <div className={styles.categoryGrid}>
                    <button
                      className={`${styles.categoryCard} ${selectedCategory === "all" ? styles.categoryCardActive : ""}`}
                      onClick={() => handleCategoryChange("all")}
                    >
                      <div className={styles.categoryIcon}>
                        <img
                          src={getCategoryIcon("all")}
                          alt="Все категории"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div>Все категории</div>
                    </button>
                    {currentCategories.length > 0 &&
                      currentCategories.map((category) => (
                        <button
                          key={category.id}
                          className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.categoryCardActive : ""}`}
                          onClick={() => handleCategoryChange(category.id)}
                        >
                          <div className={styles.categoryIcon}>
                            {[
                              "tumby",
                              "komody",
                              "stoly",
                              "stulya",
                              "taburety-i-stulya",
                              "konsoli",
                              "vitriny",
                              "shkafy",
                              "krovati",
                              "zerkala",
                              "taburety",
                              "banketki",
                              "stelazhi",
                              "divani",
                              "poufi",
                              "other",
                            ].includes(category.id) ? (
                              <img
                                src={getCategoryIcon(category.id)}
                                alt={category.nameRu}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            ) : (
                              <img
                                src={getCategoryIcon("all")}
                                alt={category.nameRu}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            )}
                          </div>
                          <div>{category.nameRu}</div>
                        </button>
                      ))}
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;

import type { Product } from '~/types/product'
import { getMinPrice } from '~/utils/constants'

/**
 * Получить базовый URL сайта
 */
function getBaseUrl(): string {
  if (import.meta.server) {
    const config = useRuntimeConfig()
    return config.public.siteUrl || 'https://flakonista.by'
  }
  return window.location.origin
}

/**
 * Генерация структурированных данных для организации
 */
export function useOrganizationStructuredData() {
  const baseUrl = getBaseUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Flakonista',
    description: 'Премиальная парфюмерия с доставкой по Беларуси',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    sameAs: [
      // Добавьте ссылки на социальные сети, если есть
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Russian', 'Belarusian'],
    },
  }
}

/**
 * Генерация структурированных данных для товара (Product)
 */
export function useProductStructuredData(product: Product) {
  const baseUrl = getBaseUrl()
  const productUrl = `${baseUrl}/products/${product.id}`
  const minPrice = getMinPrice(product)
  const images = product.image_path?.filter(Boolean) || []
  const imageUrls = images.map((img) => (img.startsWith('http') ? img : `${baseUrl}${img}`))

  const offers: Array<{
    '@type': string
    price: string
    priceCurrency: string
    availability: string
    url: string
  }> = []

  // Добавляем предложения для каждого доступного объема
  if (product.price_3ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_3ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }
  if (product.price_5ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_5ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }
  if (product.price_10ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_10ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }
  if (product.price_15ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_15ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }
  if (product.price_60ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_60ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }
  if (product.price_70ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_70ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }
  if (product.price_80ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_80ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }
  if (product.price_90ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_90ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }
  if (product.price_100ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_100ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }
  if (product.price_105ml) {
    offers.push({
      '@type': 'Offer',
      price: product.price_105ml.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }

  // Если нет предложений, добавляем одно с минимальной ценой
  if (offers.length === 0 && minPrice > 0) {
    offers.push({
      '@type': 'Offer',
      price: minPrice.toString(),
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    })
  }

  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.benefits ||
      product.suits ||
      `Парфюм ${product.name}${product.brand?.name ? ` от ${product.brand.name}` : ''}`,
    image: imageUrls.length > 0 ? imageUrls : undefined,
    brand: product.brand?.name
      ? {
          '@type': 'Brand',
          name: product.brand.name,
        }
      : undefined,
    sku: product.id,
    mpn: product.id,
    url: productUrl,
    category: 'Парфюмерия',
  }

  if (offers.length > 0) {
    structuredData.offers =
      offers.length === 1
        ? offers[0]
        : { '@type': 'AggregateOffer', offerCount: offers.length, offers }
  }

  // Добавляем дополнительные свойства, если они есть
  if (product.profile_tags && product.profile_tags.length > 0) {
    structuredData.additionalProperty = product.profile_tags.map((tag) => ({
      '@type': 'PropertyValue',
      name: 'Тег',
      value: tag,
    }))
  }

  return structuredData
}

/**
 * Генерация структурированных данных для хлебных крошек (BreadcrumbList)
 */
export function useBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const baseUrl = getBaseUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }
}

/**
 * Генерация структурированных данных для веб-сайта
 */
export function useWebSiteStructuredData() {
  const baseUrl = getBaseUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Flakonista',
    description: 'Премиальная парфюмерия с доставкой по Беларуси',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/catalog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

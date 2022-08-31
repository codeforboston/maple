import { ParsedUrlQuery } from 'querystring';
import { GetStaticProps, GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nextConfig from '../next-i18next.config'

interface ILocaleParam extends ParsedUrlQuery {
  locale: string
}

export const getI18nPaths = () => {
  return i18nextConfig.i18n.locales.map((lng) => ({
    params: {
      locale: lng
    }
  }))
}

export const getStaticPaths = () => {
  return {
    fallback: false,
    paths: getI18nPaths()
  }
}

export async function getI18nProps(context: GetStaticPropsContext, ns: string[] = ['common']) {

  const { locale } = context?.params as ILocaleParam
  let props = {
    ...(await serverSideTranslations(locale, ns))
  }
  return props
}

export function makeStaticProps(ns: string[] = []) {
  const getStaticProps: GetStaticProps = async context => {

    const props = await getI18nProps(context, ns)
    return {
      props
    }
  }

  return getStaticProps
}
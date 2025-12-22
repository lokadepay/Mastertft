<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronUp, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
library.add(faChevronUp, faMagnifyingGlass)
</script>

<template>
<header class="header">
    <div class="header__container">
        <NuxtLink to="/" class="header__logo">
            <div class="header__logo__img">
                <img src="images/logos/mastertft-ss-fond.png" alt="MasterTFT"/>
            </div>
            <div class="header__logo__txt">
                <span class="master">MASTER</span>
                <span class="tft">TFT</span>
            </div>
        </NuxtLink>

        <nav class="header__nav">
            <NuxtLink to="/tierlist" class="header__nav__item">tierlist</NuxtLink>
            <NuxtLink to="/comps" class="header__nav__item">comps</NuxtLink>
            <div class="header__nav__item-dropdown" :class="{ 'active-parent': $route.path.includes('/stats') }">
                <span>STATS</span>
                <FontAwesomeIcon :icon="faChevronUp" class="chevron" />
                <div class="dropdown-content">
                    <NuxtLink to="/stats/augments">augments</NuxtLink>
                    <NuxtLink to="/stats/items">items</NuxtLink>
                    <NuxtLink to="/stats/units">units</NuxtLink>
                <!--    <NuxtLink to="/stats/traits">traits</NuxtLink> -->
                </div>
            </div>
            <div class="header__nav__item-dropdown" :class="{ 'active-parent': $route.path.includes('/infos') }">
                <span>INFOS</span>
                <FontAwesomeIcon :icon="faChevronUp" class="chevron" />
                <div class="dropdown-content">
                    <NuxtLink to="/infos/patch-notes">patch notes</NuxtLink>
                    <NuxtLink to="/infos/set-infos">set infos</NuxtLink>
                    <NuxtLink to="/infos/tables">tables</NuxtLink>
                </div>
            </div>
        </nav>

        <div class="header__search">
            <input type="text" placeholder="Search any Units, Traits..." />
            <FontAwesomeIcon :icon="faMagnifyingGlass" class="search-icon"/>
        </div>

    </div>
</header>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;

.header {
    background: $dark-purple;
    height: 80px;
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 2px solid $light-purple;
    box-shadow: 0px 4px 10px 4px rgba($light-purple, 0.25);
    user-select: none;

    &__container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        padding: 0 40px;
    }

    /* --- LOGO --- */
    &__logo {
        display: flex;
        align-items: center;
        gap: 8px;

        &__img {
            height: 48px;
            width: 48px;
            
            img {
                height: 100%;
                width: 100%;
                object-fit: contain;
            }
        }

        &__txt {
            display: flex;
            flex-direction: column;
            line-height: 0.8;
            font-family: $title-font;
            justify-content: center;
            color: $light-purple;
            font-size: 28px;
        }
    }

    /* --- NAV --- */
    &__nav {
        display: flex;
        align-items: center;
        gap: 16px;
        height: 100%;

        &__item, &__item-dropdown {
            color: $common-text;
            font-family: $title-font;
            font-size: 24px;
            display: flex;
            align-items: center;
            padding: 0 12px;
            position: relative;
            border-radius: 8px;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 0.3s ease,
                        background 0.3s ease,
                        color 0.3s ease,
                        border 0.3s ease;

            &:hover {
                transform: translateY(-4px) translateX(10px);
                background: $deep-purple;
                box-shadow: -10px 14px 20px rgba(black, 0.75);
                color: $light-purple;
                border: 2px solid $light-purple;
                cursor: pointer;
            }

            &.router-link-active, &.active-parent {
                transform: translateY(0) translateX(0);
                background: $deep-purple;
                color: $light-purple;
                border: 2px solid $light-purple; 
            }
        }

        &__item-dropdown {
            .chevron {
                font-size: 16px;
                margin-left: 8px;
                transition: transform 0.3s ease;
            }

            &:hover {
                .chevron {
                    transform: rotate(180deg);
                }

                .dropdown-content {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
            }

            .dropdown-content {
                position: absolute;
                top: 120%;
                left: 0;
                background: $deep-purple;
                border: 1px solid $light-purple;
                border-radius: 8px;
                min-width: 160px;
                padding: 8px;
                display: flex;
                flex-direction: column;
                gap: 2px;

                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease;

                a {
                    color: $common-text;
                    font-size: 20px;
                    border-radius: 4px;
                    padding: 0 4px;
                    transition: transform 0.2s ease, background 0.3s ease;

                    &:hover {
                        background: $light-purple;
                        color: $dark-purple;
                        transform: translateX(18px);
                        box-shadow: -4px 4px 8px rgba(black, 0.75);
                    }
                }
            }
        }
    }

    /* --- SEARCH BAR --- */
    &__search {
        position: relative;
        display: flex;
        align-items: center;

        input {
            background-color: $dark-purple;
            border: 2px solid $light-purple;
            border-radius: 20px;
            padding: 4px 12px;
            min-width: 240px;
            color: $common-text;
            font-family: $text-font;
            font-size: 14px;
            transition: all 0.3s ease;

            &::placeholder {
                color: $second-text;
            }

            &:focus {
                border:2px solid $light-purple;
                box-shadow: 0 0 0 4px rgba($light-purple, 0.8);
            }
        }

        .search-icon {
            position: absolute;
            right: 15px;
            color: $light-purple;
            pointer-events: none;
        } 
    }
}

</style>
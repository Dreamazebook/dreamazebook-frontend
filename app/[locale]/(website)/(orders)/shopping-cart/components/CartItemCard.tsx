"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CartItem as CartItemType } from "@/types/cart";
import DisplayPrice from "../../../components/component/DisplayPrice";
import { Link, useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import KickstarterInlineCard from "./KickstarterInlineCard";
import { getChristmasBundleCover } from "@/utils/bookCovers";

interface CartItemProps {
  showEditBook?: boolean;
  item: CartItemType;
  selectedItems?: number[];
  onQuantityChange?: (id: number, delta: number) => void;
  onRemoveItem?: (id: number) => void;
  onToggleSelect?: (id: number) => void;
  handleClickEditMessage?: (orderItem: any) => Promise<void> | void;
  isSubItem?: boolean;
}

export default function CartItemCard({
  isSubItem = false,
  showEditBook,
  item,
  selectedItems,
  onQuantityChange,
  onRemoveItem,
  onToggleSelect,
  handleClickEditMessage,
}: CartItemProps) {
  const t = useTranslations("ShoppingCart");
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isAddonLoading, setIsAddonLoading] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const isPackage = item.item_type === "package";
  const packageCode =
    (item as any)?.package_code || (item as any)?.package_snapshot?.code;
  const isChristmasBundle =
    typeof packageCode === "string" && packageCode.startsWith("CHRISTMAS_");
  const isKickstarterPackage = isPackage && !isChristmasBundle;

  const pkgSnapshot = (item as any)?.package_snapshot;
  const pkgName = (item as any)?.package_name || pkgSnapshot?.name?.en || packageCode || "Bundle";
  const pkgDesc = (item as any)?.package_description || pkgSnapshot?.description?.en;
  const pkgCurrency = (item as any)?.currency_code || pkgSnapshot?.currency_code || "USD";
  const pkgBookCount = (item as any)?.package_item_count ?? pkgSnapshot?.book_count;
  const pkgDefaultOptions = pkgSnapshot?.default_options || {};

  useEffect(() => {
    checkAndShowCountdown(item.added_at);
    return () => {
      setCountdown(null);
    };
  }, []);

  const checkAndShowCountdown = (createdAt: string) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 4) {
      const remainingMs = 4 * 60 * 60 * 1000 - diffInMs;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor(
        (remainingMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setCountdown(`${hours}:${minutes}:${seconds}`);

      const timer = setInterval(() => {
        const updatedNow = new Date();
        const updatedDiffInMs = updatedNow.getTime() - createdDate.getTime();
        const updatedRemainingMs = 4 * 60 * 60 * 1000 - updatedDiffInMs;

        if (updatedRemainingMs <= 0) {
          clearInterval(timer);
          setCountdown(null);
        } else {
          const updatedHours = Math.floor(
            updatedRemainingMs / (1000 * 60 * 60)
          );
          const updatedMinutes = Math.floor(
            (updatedRemainingMs % (1000 * 60 * 60)) / (1000 * 60)
          );
          const updatedSeconds = Math.floor(
            (updatedRemainingMs % (1000 * 60)) / 1000
          );
          setCountdown(`${updatedHours}:${updatedMinutes}:${updatedSeconds}`);
        }
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(null);
    }
  };

  return (
    <div
      className={`bg-white ${
        !isPackage ? "w-full pl-3 opacity-100 rounded" : ""
      }`}
    >
      <div
        className={`flex ${isPackage ? "items-start" : "items-center"} gap-3 ${
          !isPackage ? "h-full relative" : ""
        }`}
      >
        {onToggleSelect && selectedItems && !isPackage && (
          <div
            className={`relative inline-block h-6 w-6 ${
              isPackage ? "mt-1" : ""
            }`}
          >
            <span
              onClick={() => onToggleSelect(item.id)}
              className={`absolute top-0 left-0 h-6 w-6 rounded-full border-2 ${
                selectedItems.includes(item.id)
                  ? "bg-[#012CCE]"
                  : "border-gray-300"
              } transition-colors duration-200 flex items-center justify-center`}
            >
              {selectedItems.includes(item.id) && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </span>
          </div>
        )}

        <div className="flex-1">
          {item.item_type !== "package" ? (
            <div className="flex items-center gap-4 h-full relative">
              <div className="w-20 h-22 rounded overflow-hidden">
                <img
                  src={item.book_cover || "/home-page/cover.png"}
                  alt={item.sku_code}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full space-y-4 pt-4 pr-6 pb-4 opacity-100 box-border">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">
                    {item.book_name || item.spu_code} -{" "}
                    {item.full_name || "Name"}
                  </h3>
                  <div className="flex items-center gap-3">
                    <DisplayPrice
                      style="text-[#222222] font-bold"
                      value={item.total_price}
                    />
                    {onRemoveItem && (
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 2a2 2 0 00-2 2v1H2.5a.5.5 0 000 1h.548l.764 10.697A2 2 0 005.8 19h8.4a2 2 0 001.988-1.303L16.952 6H17.5a.5.5 0 000-1H15V4a2 2 0 00-2-2H6zm3 13a.5.5 0 01-1 0V8a.5.5 0 011 0v7zm3 0a.5.5 0 01-1 0V8a.5.5 0 011 0v7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* <p className='text-[#666666] font-[400] capitalize'>
                {item.binding_type}
                {(item.binding_type && (item.description || item.edition)) && ' | '}
                {item.description || item.edition}
              </p> */}

                {/* {(countdown && handleClickEditMessage) ? 
                  <p className="text-sm text-gray-600">You can modify your message within {countdown} <a onClick={()=>handleClickEditMessage(item)} className='text-[#012CCE] cursor-pointer'>Edit</a></p>
                  :
                  <p className={`text-[#666] bg-[#f8f8f8] font-[400] ${item.message?'p-2':''} rounded`}>{item.message}</p>
                } */}

                {/* 额外描述合并到装订信息一行展示 */}

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 overflow-hidden">
                    {showEditBook &&
                      (item.preview_id ? (
                        <a
                          className={`text-sm text-blue-600 hover:underline cursor-pointer ${
                            isPackage ? "mt-2" : ""
                          } ${
                            isEditLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={async (e) => {
                            e.preventDefault();
                            if (isEditLoading) return;

                            if (handleClickEditMessage) {
                              setIsEditLoading(true);
                              try {
                                await handleClickEditMessage(item);
                              } finally {
                                setIsEditLoading(false);
                              }
                            } else {
                              const url = `/personalized-products/${item.spu_code}/${item.preview_id}/edit`;
                              router.push(url);
                            }
                          }}
                        >
                          {isEditLoading ? "Loading..." : t("editBook")}
                        </a>
                      ) : (
                        <a
                          className={`text-sm text-blue-600 hover:underline cursor-pointer ${
                            isPackage ? "mt-2" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            // 无预览则去创建
                            const bookId =
                              (item as any)?.spu_code ||
                              (item as any)?.picbook_id ||
                              (item as any)?.picbook?.id;
                            let url = "";
                            if (bookId) {
                              const ksParams = isSubItem
                                ? `&ks=1&package_item_id=${
                                    (item as any)?.id || ""
                                  }&package_id=${
                                    (item as any)?.package_id || ""
                                  }`
                                : "";
                              url = `/personalize?bookid=${bookId}${ksParams}`;
                            } else {
                              url = "/shopping-cart";
                            }
                            router.push(url);
                          }}
                        >
                          {t("editBook")}
                        </a>
                      ))}

                    {/* 添加附加产品链接：进入编辑页的附加项标签 */}
                    {item.status === "pending" && (
                      <a
                        className={`text-sm text-blue-600 hover:underline cursor-pointer truncate max-w-[180px] md:max-w-[260px] ${
                          isAddonLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={async (e) => {
                          e.preventDefault();
                          if (isAddonLoading) return;
                          setIsAddonLoading(true);
                          try {
                            const bookId =
                              (item as any)?.spu_code ||
                              (item as any)?.picbook_id ||
                              (item as any)?.picbook?.id;
                            if (item.preview_id) {
                              await router.push(
                                `/preview?bookid=${item.spu_code}&previewid=${item.preview_id}&fromCartItemId=${item.id}&tab=giftBox`
                              );
                            } else if (bookId) {
                              await router.push(
                                `/personalize?bookid=${bookId}&step=addons`
                              );
                            } else {
                              await router.push("/shopping-cart");
                            }
                          } catch (e) {
                            setIsAddonLoading(false);
                          }
                        }}
                      >
                        {isAddonLoading
                          ? "Loading..."
                          : t("addAdditionalProducts")}
                      </a>
                    )}
                  </div>
                </div>

                {onQuantityChange && (
                  <div className="inline-flex items-center border rounded-md">
                    <button
                      onClick={() => onQuantityChange(item.id, -1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span
                      // type="number"
                      // min="1"
                      // value={item.quantity}
                      // onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) - item.quantity)}
                      className="w-12 text-center border-x py-1"
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onQuantityChange(item.id, 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 h-10 pt-4 px-3 opacity-100">
                <div className="flex items-center gap-2">
                  {onToggleSelect && selectedItems && (
                    <div className="relative inline-block h-6 w-6">
                      <span
                        onClick={() => onToggleSelect(item.id)}
                        className={`absolute top-0 left-0 h-6 w-6 rounded-full border-2 ${
                          selectedItems.includes(item.id)
                            ? "bg-[#012CCE]"
                            : "border-gray-300"
                        } transition-colors duration-200 flex items-center justify-center`}
                      >
                        {selectedItems.includes(item.id) && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                    </div>
                  )}
                  {isChristmasBundle ? (
                    <span className="font-medium text-[#222222] text-[18px] leading-[24px] tracking-[0.15px] max-w-[260px]">
                      {pkgName}
                    </span>
                  ) : (
                    <img src="/covers/ks.png" alt="KICKSTARTER" className="h-4 object-contain" />
                  )}
                </div>

                {/* spacer: keep price + delete aligned to the far right */}
                <div className="flex-1" />

                {isChristmasBundle && (
                  <div className="flex items-center justify-end gap-3 shrink-0">
                    <DisplayPrice
                      style="text-[#222222] font-bold"
                      value={(item as any)?.total_price ?? item.total_price}
                    />
                  </div>
                )}
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer pr-3"
                    aria-label="Remove package"
                    title="Remove"
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M6 2a2 2 0 00-2 2v1H2.5a.5.5 0 000 1h.548l.764 10.697A2 2 0 005.8 19h8.4a2 2 0 001.988-1.303L16.952 6H17.5a.5.5 0 000-1H15V4a2 2 0 00-2-2H6zm3 13a.5.5 0 01-1 0V8a.5.5 0 011 0v7zm3 0a.5.5 0 01-1 0V8a.5.5 0 011 0v7z" />
                    </svg>
                  </button>
                )}
              </div>
              {isKickstarterPackage &&
                (item.ks_pending || item.subItems?.length === 0) &&
                item.package_id && (
                  <KickstarterInlineCard packageId={item.package_id} />
                )}
              {isChristmasBundle && (
                <div className="px-12 pb-4">
            

                  {/* Books list (already chosen) */}
                  <div className="">
                    {Array.isArray((item as any)?.items) &&
                      (item as any).items.map((pi: any) => {
                        const spuCode = pi?.spu_code
                        const bookName = pi?.spu_name || spuCode || "Book"
                        const bindingType =
                          pi?.customization_data?.binding_type ||
                          pkgDefaultOptions?.binding_type ||
                          ""
                        const coverType =
                          pi?.customization_data?.cover_type ||
                          pkgDefaultOptions?.cover_type ||
                          ""
                        const spec = [bindingType, coverType].filter(Boolean).join(" · ")

                        const hasPreview = !!pi?.preview_id
                        const ctaLabel = hasPreview ? "Edit book" : "create book"
                        const ctaHref = hasPreview
                          ? `/personalized-products/${spuCode}/${pi.preview_id}/edit`
                          // 圣诞 bundle：跳转到 preview 后不展示 option tab
                          : `/personalize?bookid=${spuCode}&hideOptions=1&fromCartItemId=${encodeURIComponent(String(pi?.id ?? ''))}${coverType ? `&cover_type=${encodeURIComponent(coverType)}` : ''}${bindingType ? `&binding_type=${encodeURIComponent(bindingType)}` : ''}`

                        return (
                          <div key={pi?.id || `${spuCode}-${pi?.item_index}`} className="flex md:h-[120px] items-center">
                            <div className="w-[88px] h-[100px] overflow-hidden flex items-center justify-center self-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getChristmasBundleCover(spuCode)}
                                alt={bookName}
                                className="max-w-full max-h-full object-contain block"
                              />
                            </div>

                            <div className="flex-1 min-w-0 py-4 px-6">
                              <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                  <p className="text-[18px] font-medium leading-[24px] tracking-[0.15px] text-[#222222] truncate">
                                    {bookName}
                                  </p>
                                  {spec && (
                                    <p className="text-[#666666] text-[16px] leading-[24px] tracking-[0.5px] truncate">{spec}</p>
                                  )}
                                  <a
                                    className="text-blue-600 text-[14px] leading-[20px] tracking-[0.25px] hover:underline cursor-pointer inline-block mt-2"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      router.push(ctaHref)
                                    }}
                                  >
                                    {ctaLabel}
                                  </a>
                                </div>

                                <div className="shrink-0 text-right">
                                  <span className="text-[18px] font-medium leading-[24px] tracking-[0.15px] text-[#222222]">
                                    $0 {pkgCurrency}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  {/* Gifts */}
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    {/* Gift box (赠品)：按书本数量显示 */}
                    {/* <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-6 min-w-0">
                        <div className="w-[72px] h-[72px] rounded overflow-hidden bg-[#F8F8F8] shrink-0">
                          <img src="/wrap.png" alt="gift box" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[22px] font-semibold text-[#222222] truncate">
                            a festive gift box <span className="text-[#222222]/80">赠品</span>
                          </p>
                          <a className="text-blue-600 text-[18px] hover:underline cursor-pointer inline-block mt-2">
                            details
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#666666] text-[18px]">Qty</span>
                        <input
                          className="w-16 border border-blue-600 rounded px-2 py-1 text-center"
                          value={pkgBookCount ?? ""}
                          readOnly
                        />
                      </div>
                    </div> */}

                    {/* Extra gifts summary */}
                    <div className="text-[#666666] text-sm space-y-1">
                      {!!pkgDefaultOptions?.includes_stickers && (
                        <p>Stickers × {pkgDefaultOptions?.stickers_count ?? "-"}</p>
                      )}
                      {!!pkgDefaultOptions?.includes_bookmarks && (
                        <p>Bookmarks × {pkgDefaultOptions?.bookmarks_count ?? "-"}</p>
                      )}
                      {!!pkgDefaultOptions?.includes_personalized_cover && (
                        <p>Personalized book cover × {pkgDefaultOptions?.personalized_cover_count ?? "-"}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {item.subItems && item.subItems.length > 0 && (
            <div className="mt-3 ml-[2.5rem]">
              {item.subItems.map((sub, idx) => (
                <CartItemCard
                  key={sub.id}
                  item={sub}
                  isSubItem={true}
                  showEditBook={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

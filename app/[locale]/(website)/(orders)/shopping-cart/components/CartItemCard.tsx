"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CartItem as CartItemType, getFormatedCover, getFormatedGiftbox } from "@/types/cart";
import DisplayPrice from "../../../components/component/DisplayPrice";
import { Link, useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import KickstarterInlineCard from "./KickstarterInlineCard";
import { getR2BookCover } from "@/utils/bookCovers";
import { formatCartBookTitle, getOurBookDisplayName } from "@/utils/bookNames";

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
  const tSafe = (key: string, fallback: string) =>
    // next-intl v3 支持 t.has；避免 dev 环境 messages 热更新不及时导致页面直接抛错
    (typeof (t as any)?.has === "function" && (t as any).has(key)) ? (t as any)(key) : fallback;
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

  // 后端新增字段：mode = create|edit，用于决定购物车 item 的按钮语义
  // 兼容旧数据：无 mode 时用 preview_id 推断
  const effectiveMode = (item as any)?.mode ?? (item.preview_id ? "edit" : "create");
  const isEditMode = effectiveMode === "edit" && !!item.preview_id;

  const pkgSnapshot = (item as any)?.package_snapshot;
  const pkgName = (item as any)?.package_name || pkgSnapshot?.name?.en || packageCode || "Bundle";
  const getChristmasPackageDisplayName = (rawName: string, code?: string | null) => {
    const c = String(code || '').toUpperCase();
    // 需求：把 “Premium Lay-Flat Hardcover Books x2” 这种长标题改成更短的展示名
    if (c.includes('PREMIUM_LAYFLAT')) return 'Premium Lay-Flat Set';
    // 兜底：Hardcover 也统一成更短的展示名（避免同类问题）
    if (c.includes('HARDCOVER')) return 'Classic Hardcover Set';
    // 兜底：如果后端直接给了长名字，也用关键词缩短
    const n = String(rawName || '');
    if (/premium\s*lay-?flat/i.test(n)) return 'Premium Lay-Flat Set';
    if (/hardcover/i.test(n)) return 'Classic Hardcover Set';
    return rawName;
  };
  const pkgDisplayName = isChristmasBundle ? getChristmasPackageDisplayName(pkgName, packageCode) : pkgName;
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
      className={`bg-white w-full min-w-0 ${
        !isPackage ? "pl-3 opacity-100 rounded" : ""
      }`}
    >
      <div
        className={`flex w-full min-w-0 ${isPackage ? "items-start" : "items-center"} gap-3 ${
          !isPackage ? "h-full relative" : ""
        }`}
      >
        {onToggleSelect && selectedItems && !isPackage && (
          <div
            className={`relative inline-block h-5 w-5 md:h-6 md:w-6 ${
              isPackage ? "mt-1" : ""
            }`}
          >
            <span
              onClick={() => onToggleSelect(item.id)}
              className={`absolute top-0 left-0 h-5 w-5 md:h-6 md:w-6 rounded-full border-2 ${
                selectedItems.includes(item.id)
                  ? "bg-[#012CCE]"
                  : "border-gray-300"
              } transition-colors duration-200 flex items-center justify-center`}
            >
              {selectedItems.includes(item.id) && (
                <svg
                  className="w-3 h-3 md:w-4 md:h-4 text-white"
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
                  src={item.cover_image || item.book_cover || "/home-page/cover.png"}
                  alt={item.product_name || item.sku_code}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full space-y-1 pt-4 pr-6 pb-4 opacity-100 box-border">
                {/* 桌面端保持原布局；手机端将价格放到书名下方，删除按钮位置不变 */}
                <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center md:w-full">
                  {/* 手机端：标题允许自动换行，避免过长导致卡片横向溢出；桌面端保持单行 */}
                  <div className="flex items-start justify-between gap-3 min-w-0 md:w-full md:items-center">
                    <h3 className="font-bold flex-1 min-w-0 whitespace-normal break-words md:whitespace-nowrap md:truncate">
                      {(() => {
                        const spuCode = (item as any)?.spu_code
                        const baseBookName =
                          getOurBookDisplayName(spuCode, item.product_name || item.book_name || item.sku_name || spuCode || "Book") ||
                          "Book"
                        const fullName = item.full_name || item.recipient_name || ""
                        return fullName && !String(baseBookName).includes(String(fullName))
                          ? `${baseBookName} | ${fullName}`
                          : baseBookName
                      })()}
                    </h3>
                    <div className="flex items-center gap-3 shrink-0">
                      {/* 桌面端：价格在右侧（与当前 UI 一致） */}
                      <div className="hidden md:block">
                        <DisplayPrice
                          style="text-[#222222] font-bold"
                          value={item.total_price}
                        />
                      </div>
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
                  {/* 手机端：价格在书名下方 */}
                  <div className="md:hidden">
                    <DisplayPrice
                      style="text-[#222222] font-bold"
                      value={item.total_price}
                    />
                  </div>
                </div>

                <p className='text-[#666666] font-[400] capitalize flex items-center gap-2'>
                  <span>{getFormatedCover(item)}</span>
                  <span>|</span>
                  <span>{getFormatedGiftbox(item)}</span>
                </p>

                {/* {(countdown && handleClickEditMessage) ? 
                  <p className="text-sm text-gray-600">You can modify your message within {countdown} <a onClick={()=>handleClickEditMessage(item)} className='text-[#012CCE] cursor-pointer'>Edit</a></p>
                  :
                  <p className={`text-[#666] bg-[#f8f8f8] font-[400] ${item.message?'p-2':''} rounded`}>{item.message}</p>
                } */}
                
                {item?.customization_data?.attributes?.gift_message &&
                <p className={`text-[#666] bg-[#f8f8f8] font-[400] p-2 rounded`}>{item?.customization_data?.attributes?.gift_message}</p>
                }

                {/* 额外描述合并到装订信息一行展示 */}

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 overflow-hidden">
                    {showEditBook &&
                      (isEditMode ? (
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
                              const fromCartParam = `&fromCartItemId=${encodeURIComponent(String(item.id))}`;
                              const ksParams = isSubItem
                                ? `&ks=1&package_item_id=${
                                    (item as any)?.id || ""
                                  }&package_id=${
                                    (item as any)?.package_id || ""
                                  }`
                                : "";
                              // 关键：把 cart item id 透传给 personalize/preview，用于后续 regenerate-preview 绑定，避免重复新增
                              // Create mode从购物车进入：不要在 preview 页预选 Options（仅影响该 create 流程，不影响编辑/其他入口）
                              url = `/personalize?bookid=${bookId}${ksParams}${fromCartParam}&skipPrefillOptions=1`;
                            } else {
                              url = "/shopping-cart";
                            }
                            router.push(url);
                          }}
                        >
                          {tSafe("createBook", "Create book")}
                        </a>
                      ))}

                    {/* 添加附加产品链接：进入编辑页的附加项标签 */}
                    {showEditBook && item.status === "pending" && (
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
            <div className="flex flex-col md:gap-3 gap-0">
              {/* bundle 标题行：手机端允许换行，因此不能固定高度 */}
              <div className="flex items-start gap-3 pt-4 px-3 opacity-100 w-full">
                {/* 左侧：允许收缩，避免长标题把整行撑出屏幕 */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {onToggleSelect && selectedItems && (
                    <div className="relative inline-block h-5 w-5 md:h-6 md:w-6">
                      <span
                        onClick={() => onToggleSelect(item.id)}
                        className={`absolute top-0 left-0 h-5 w-5 md:h-6 md:w-6 rounded-full border-2 ${
                          selectedItems.includes(item.id)
                            ? "bg-[#012CCE]"
                            : "border-gray-300"
                        } transition-colors duration-200 flex items-center justify-center`}
                      >
                        {selectedItems.includes(item.id) && (
                          <svg
                            className="w-3 h-3 md:w-4 md:h-4 text-white"
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
                    <span className="font-medium text-[#222222] text-[16px] md:text-[18px] leading-[20px] md:leading-[24px] tracking-[0.15px] md:tracking-[0.15px] whitespace-normal break-words md:whitespace-nowrap md:truncate min-w-0">
                      {pkgDisplayName}
                    </span>
                  ) : (
                    <img src="/covers/ks.png" alt="KICKSTARTER" className="h-4 object-contain" />
                  )}
                </div>

                {/* 圣诞 bundle：总价保持在名称右侧（各端一致），删除按钮位置不变 */}
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
              {/* 圣诞 bundle：总价已在标题行右侧展示（无需手机端额外一行） */}
              {isKickstarterPackage &&
                (item.ks_pending || item.subItems?.length === 0) &&
                item.package_id && (
                  <KickstarterInlineCard packageId={item.package_id} />
                )}
              {isChristmasBundle && (
                <div className="px-9 md:px-12 pb-4">
            

                  {/* Books list (already chosen) */}
                  <div className="">
                    {Array.isArray((item as any)?.items) &&
                      (item as any).items.map((pi: any) => {
                        const spuCode = pi?.spu_code
                        const baseBookName =
                          getOurBookDisplayName(spuCode, pi?.spu_name || spuCode || "Book") || "Book"
                        const fullName =
                          pi?.customization_data?.full_name ||
                          pi?.customization_data?.recipient_name ||
                          pi?.full_name ||
                          pi?.preview?.recipient_name ||
                          ""
                        // 圣诞 bundle：与普通书保持一致，若已填写 full_name，则在书名后追加后缀（如：Santa's Letter for You | kiki）
                        // 备注：这里用 "|" 作为分隔符（与普通购物车非 bundle 卡片保持一致的展示风格）
                        const bookName =
                          fullName && !String(baseBookName).includes(String(fullName))
                            ? `${baseBookName} | ${fullName}`
                            : baseBookName
                        const bindingType =
                          pi?.customization_data?.binding_type ||
                          pkgDefaultOptions?.binding_type ||
                          ""
                        const coverType =
                          pi?.customization_data?.cover_type ||
                          pkgDefaultOptions?.cover_type ||
                          ""

                        // 根据 cover_type 自动展示 cover option 图片：
                        // - personalized → cover_3
                        // - 其他/缺省 → cover_1
                        const normalizeSpuForCover = (spu: string) => (spu === 'PICBOOK_GOODNIGHT3' ? 'PICBOOK_GOODNIGHT' : spu);
                        const coverId =
                          String(coverType || '').toLowerCase().includes('personalized') ? '3' : '1';
                        const coverOptionImageUrl =
                          spuCode
                            ? `https://pub-9cf31543472247c2936bb3ad6524d445.r2.dev/products/picbooks/${encodeURIComponent(
                                normalizeSpuForCover(String(spuCode)),
                              )}/covers/cover_${encodeURIComponent(coverId)}/base.webp`
                            : '';

                        // 圣诞 bundle 子项：preview_id 可能在 customization_data.preview_id（而不是顶层 preview_id）
                        const piPreviewId =
                          pi?.preview_id ||
                          pi?.customization_data?.preview_id ||
                          (pi as any)?.preview?.preview_id ||
                          null
                        const piMode = pi?.mode ?? (piPreviewId ? "edit" : "create")
                        const piIsEdit = piMode === "edit" && !!piPreviewId
                        const ctaLabel = piIsEdit ? t("editBook") : tSafe("createBook", "Create book")
                        const ctaHref = piIsEdit
                          ? `/personalized-products/${spuCode}/${encodeURIComponent(String(piPreviewId))}/edit`
                          // 圣诞 bundle：跳转到 preview 后不展示 option tab
                          : `/personalize?bookid=${spuCode}&hideOptions=1&fromCartItemId=${encodeURIComponent(String(pi?.id ?? ''))}${coverType ? `&cover_type=${encodeURIComponent(coverType)}` : ''}${bindingType ? `&binding_type=${encodeURIComponent(bindingType)}` : ''}`

                        return (
                          <div key={pi?.id || `${spuCode}-${pi?.item_index}`} className="flex md:h-[120px] items-center">
                            {/* 圣诞 bundle 子项封面：移动端 56x56，桌面端保持原尺寸 */}
                            {/* 圣诞 bundle 子项封面：手机端左上对齐（贴顶），桌面端保持居中 */}
                            <div className="w-14 h-14 md:w-[88px] md:h-[100px] overflow-hidden flex items-start justify-center md:items-center md:justify-center self-start md:self-center pt-3 md:p-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={coverOptionImageUrl || getR2BookCover(spuCode)}
                                alt={bookName}
                                className="max-w-full max-h-full object-contain object-left md:object-center block"
                                onError={(e) => {
                                  try {
                                    (e.currentTarget as HTMLImageElement).src = getR2BookCover(spuCode);
                                  } catch {}
                                }}
                              />
                            </div>

                            <div className="flex-1 min-w-0 p-3 md:py-4 md:px-6">
                              <div className="flex items-start justify-between">
                                {/* 左侧：桌面端上下 space-between（标题在上，按钮贴底）；移动端保持自然流式 */}
                                <div className="min-w-0 flex flex-col md:justify-between md:min-h-[72px]">
                                  <div className="min-w-0">
                                    <p className="md:text-[18px] text-[16px] font-medium md:leading-[24px] leading-[20px] tracking-[0.15px] md:tracking-[0.15px] text-[#222222] whitespace-normal break-words md:whitespace-nowrap md:truncate">
                                      {bookName}
                                    </p>
                                    {/* 手机端：子书价格放到书名下方；桌面端保持右侧显示 */}
                                    <div className="md:hidden mt-1">
                                      <span className="md:text-[18px] text-[16px] font-medium md:leading-[24px] leading-[20px] tracking-[0.15px] md:tracking-[0.15px] text-[#222222]">
                                        $0 {pkgCurrency}
                                      </span>
                                    </div>
                                  </div>

                                  <a
                                    className="text-blue-600 text-[14px] leading-[20px] tracking-[0.25px] hover:underline cursor-pointer inline-block mt-2 md:mt-0"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      router.push(ctaHref)
                                    }}
                                  >
                                    {ctaLabel}
                                  </a>
                                </div>

                                <div className="hidden md:block shrink-0 text-right">
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

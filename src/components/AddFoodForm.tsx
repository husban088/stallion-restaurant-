"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";

interface FoodSize {
  size: string;
  price: number;
  cutPrice?: number;
}

interface CategoryData {
  name: string;
  description: string;
  sizes: FoodSize[];
  images: File[];
  imagePreviews: string[];
}

export default function AddFoodForm() {
  const [foodType, setFoodType] = useState<"fast_food" | "fried_food" | "">("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState<
    Record<string, CategoryData>
  >({});
  const [friedCategory, setFriedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fastFoodCategories = ["Pizza", "Pasta", "Burger", "Fries"];
  const friedFoodCategories = ["Chicken Qorma", "Beef Qorma", "Mutton Qorma"];
  const pizzaSizes = ["Small", "Medium", "Large", "Extra Large"];
  const plateSizes = ["Half Plate", "Full Plate"];

  // Simulate form initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, []);

  // Cleanup image previews to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(categoryData).forEach((data) => {
        data.imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      });
    };
  }, [categoryData]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCategoryData((prev) => ({
      ...prev,
      [category]: prev[category] || {
        name: "",
        description: "",
        sizes: [],
        images: [],
        imagePreviews: [],
      },
    }));
  };

  const handleInputChange = (
    category: string,
    field: keyof CategoryData,
    value: any
  ) => {
    setCategoryData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleImageChange = (
    category: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).filter((file) => {
        const isValidType = ["image/jpeg", "image/png"].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        if (!isValidType) {
          toast.error("Only JPEG or PNG images are allowed");
          return false;
        }
        if (!isValidSize) {
          toast.error("Image size must be less than 5MB");
          return false;
        }
        return true;
      });

      const availableSlots = 2 - categoryData[category].images.length;
      const imagesToAdd = newImages.slice(0, availableSlots);

      if (imagesToAdd.length < newImages.length) {
        toast.error("You can upload up to 2 images per category");
      }

      if (imagesToAdd.length > 0) {
        setCategoryData((prev) => ({
          ...prev,
          [category]: {
            ...prev[category],
            images: [...prev[category].images, ...imagesToAdd],
            imagePreviews: [
              ...prev[category].imagePreviews,
              ...imagesToAdd.map((file) => URL.createObjectURL(file)),
            ],
          },
        }));
      }
    }
  };

  const removeImage = (category: string, index: number) => {
    setCategoryData((prev) => {
      const newImages = [...prev[category].images];
      const newPreviews = [...prev[category].imagePreviews];
      URL.revokeObjectURL(newPreviews[index]); // Cleanup preview URL
      newImages.splice(index, 1);
      newPreviews.splice(index, 1);
      return {
        ...prev,
        [category]: {
          ...prev[category],
          images: newImages,
          imagePreviews: newPreviews,
        },
      };
    });
    if (fileInputRefs.current[category]) {
      fileInputRefs.current[category]!.value = "";
    }
  };

  const handleSizeToggle = (category: string, size: string) => {
    setCategoryData((prev) => {
      const currentSizes = prev[category].sizes;
      const exists = currentSizes.some((s) => s.size === size);
      const newSizes = exists
        ? currentSizes.filter((s) => s.size !== size)
        : [...currentSizes, { size, price: 0 }];
      return {
        ...prev,
        [category]: {
          ...prev[category],
          sizes: newSizes,
        },
      };
    });
  };

  const handleSizeChange = (
    category: string,
    index: number,
    field: "price" | "cutPrice",
    value: string
  ) => {
    setCategoryData((prev) => {
      const newSizes = [...prev[category].sizes];
      newSizes[index] = {
        ...newSizes[index],
        [field]: value ? Number(value) : undefined,
      };
      return {
        ...prev,
        [category]: {
          ...prev[category],
          sizes: newSizes,
        },
      };
    });
  };

  const calculatePercentOff = (price: number, cutPrice?: number) => {
    if (!cutPrice || cutPrice <= price || price <= 0) return 0;
    return Math.round(((cutPrice - price) / cutPrice) * 100);
  };

  const calculateSavePrice = (price: number, cutPrice?: number) => {
    if (!cutPrice || cutPrice <= price || price <= 0) return 0;
    return cutPrice - price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("Please log in to add food");
      }

      if (foodType === "fast_food" && selectedCategories.length === 0) {
        throw new Error("Please select at least one category");
      }
      if (foodType === "fried_food" && !friedCategory) {
        throw new Error("Please select a fried food category");
      }

      // Validate and insert for fast food
      if (foodType === "fast_food") {
        for (const category of selectedCategories) {
          const data = categoryData[category];
          if (!data.name) {
            throw new Error(`Please enter a name for ${category}`);
          }
          if (
            (category === "Pizza" || category === "Pasta") &&
            data.sizes.length === 0
          ) {
            throw new Error(`Please add at least one size for ${category}`);
          }
          if (data.sizes.some((s) => s.price <= 0)) {
            throw new Error(`Price must be greater than 0 for ${category}`);
          }

          let imageUrls: string[] = [];
          if (data.images.length > 0) {
            for (const image of data.images) {
              const fileExt = image.name.split(".").pop();
              const fileName = `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}.${fileExt}`;
              const filePath = `${user.user.id}/${fileName}`;
              const { error: uploadError } = await supabase.storage
                .from("food-images")
                .upload(filePath, image, {
                  cacheControl: "3600",
                  upsert: false,
                });
              if (uploadError) {
                throw new Error(
                  `Failed to upload image for ${category}: ${uploadError.message}`
                );
              }
              const { data: urlData } = supabase.storage
                .from("food-images")
                .getPublicUrl(filePath);
              if (!urlData.publicUrl) {
                throw new Error(`Failed to get image URL for ${category}`);
              }
              imageUrls.push(urlData.publicUrl);
            }
          }

          const { error: dbError } = await supabase.from("foods").insert([
            {
              type: foodType,
              categories: [category],
              name: data.name,
              description: data.description,
              sizes: data.sizes,
              image_urls: imageUrls,
              created_by: user.user.id,
            },
          ]);

          if (dbError) {
            throw new Error(
              `Failed to add food for ${category}: ${dbError.message}`
            );
          }
        }
      }

      // Insert for fried food
      if (foodType === "fried_food") {
        const data = categoryData[friedCategory] || {
          name: "",
          description: "",
          sizes: [],
          images: [],
          imagePreviews: [],
        };
        if (!data.name) {
          throw new Error(`Please enter a name for ${friedCategory}`);
        }
        if (data.sizes.length === 0) {
          throw new Error(`Please add at least one size for ${friedCategory}`);
        }
        if (data.sizes.some((s) => s.price <= 0)) {
          throw new Error(`Price must be greater than 0 for ${friedCategory}`);
        }

        let imageUrls: string[] = [];
        if (data.images.length > 0) {
          for (const image of data.images) {
            const fileExt = image.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}.${fileExt}`;
            const filePath = `${user.user.id}/${fileName}`;
            const { error: uploadError } = await supabase.storage
              .from("food-images")
              .upload(filePath, image, {
                cacheControl: "3600",
                upsert: false,
              });
            if (uploadError) {
              throw new Error(
                `Failed to upload image for ${friedCategory}: ${uploadError.message}`
              );
            }
            const { data: urlData } = supabase.storage
              .from("food-images")
              .getPublicUrl(filePath);
            if (!urlData.publicUrl) {
              throw new Error(`Failed to get image URL for ${friedCategory}`);
            }
            imageUrls.push(urlData.publicUrl);
          }
        }

        const { error: dbError } = await supabase.from("foods").insert([
          {
            type: foodType,
            categories: [friedCategory],
            name: data.name,
            description: data.description,
            sizes: data.sizes,
            image_urls: imageUrls,
            created_by: user.user.id,
          },
        ]);

        if (dbError) {
          throw new Error(
            `Failed to add food for ${friedCategory}: ${dbError.message}`
          );
        }
      }

      toast.success("Food(s) added successfully");
      // Reset form
      setFoodType("");
      setSelectedCategories([]);
      setCategoryData({});
      setFriedCategory("");
      // Clear file input refs for submitted categories
      if (foodType === "fast_food") {
        selectedCategories.forEach((cat) => {
          if (fileInputRefs.current[cat]) {
            fileInputRefs.current[cat]!.value = "";
            delete fileInputRefs.current[cat];
          }
        });
      } else if (foodType === "fried_food" && friedCategory) {
        if (fileInputRefs.current[friedCategory]) {
          fileInputRefs.current[friedCategory]!.value = "";
          delete fileInputRefs.current[friedCategory];
        }
      }
    } catch (error: any) {
      console.error("Error adding food:", error);
      toast.error(error.message || "Failed to add food. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return <SkeletonLoader layout="addFoodForm" />;
  }

  return (
    <div className="bg-black/80 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#d7a95f] text-center mb-8 stallion__font">
        Add Food
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6" aria-busy={loading}>
        <div>
          <label
            htmlFor="foodType"
            className="block text-sm font-medium text-white res__font"
          >
            Food Type
          </label>
          <select
            id="foodType"
            value={foodType}
            onChange={(e) => {
              setFoodType(e.target.value as "fast_food" | "fried_food" | "");
              setSelectedCategories([]);
              setCategoryData({});
              setFriedCategory("");
            }}
            className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
            required
            disabled={loading}
            aria-disabled={loading}
          >
            <option value="">Select Food Type</option>
            <option value="fast_food">Fast Food</option>
            <option value="fried_food">Fried Food</option>
          </select>
        </div>
        {foodType === "fast_food" && (
          <div>
            <label className="block text-sm font-medium text-white res__font">
              Categories
            </label>
            <div className="mt-2 flex flex-wrap gap-4">
              {fastFoodCategories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 res__font"
                  aria-label={`Select ${cat} category`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    disabled={loading}
                    className="form-checkbox h-5 w-5 text-[#d7a95f] border-[#d7a95f] focus:ring-[#d7a95f]"
                    aria-disabled={loading}
                  />
                  <span className="text-white">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {foodType === "fried_food" && (
          <div>
            <label
              htmlFor="friedCategory"
              className="block text-sm font-medium text-white res__font"
            >
              Category
            </label>
            <select
              id="friedCategory"
              value={friedCategory}
              onChange={(e) => {
                setFriedCategory(e.target.value);
                setCategoryData({
                  [e.target.value]: {
                    name: "",
                    description: "",
                    sizes: [],
                    images: [],
                    imagePreviews: [],
                  },
                });
              }}
              className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
              required
              disabled={loading}
              aria-disabled={loading}
            >
              <option value="">Select Category</option>
              {friedFoodCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
        {(foodType === "fast_food" && selectedCategories.length > 0) ||
        (foodType === "fried_food" && friedCategory) ? (
          <>
            {(foodType === "fast_food"
              ? selectedCategories
              : [friedCategory]
            ).map((category) => (
              <div key={category} className="border-t border-[#d7a95f] pt-4">
                <h3 className="text-xl font-semibold text-[#d7a95f] mb-4 stallion__font">
                  {category} Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`name-${category}`}
                      className="block text-sm font-medium text-white res__font"
                    >
                      Name
                    </label>
                    <input
                      id={`name-${category}`}
                      type="text"
                      value={categoryData[category]?.name || ""}
                      onChange={(e) =>
                        handleInputChange(category, "name", e.target.value)
                      }
                      className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                      required
                      disabled={loading}
                      aria-disabled={loading}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`description-${category}`}
                      className="block text-sm font-medium text-white res__font"
                    >
                      Description
                    </label>
                    <div className="mt-1 border border-[#d7a95f] rounded-md bg-[#222]">
                      <div className="flex flex-wrap items-center gap-2 p-2 bg-black/50 border-b border-[#d7a95f]">
                        <button
                          type="button"
                          className="px-2 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded"
                          title="Bold"
                          onClick={() =>
                            handleInputChange(
                              category,
                              "description",
                              (categoryData[category]?.description || "") +
                                "<b>Bold</b>"
                            )
                          }
                          disabled={loading}
                          aria-disabled={loading}
                        >
                          <b>B</b>
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded"
                          title="Italic"
                          onClick={() =>
                            handleInputChange(
                              category,
                              "description",
                              (categoryData[category]?.description || "") +
                                "<i>Italic</i>"
                            )
                          }
                          disabled={loading}
                          aria-disabled={loading}
                        >
                          <i>I</i>
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded"
                          title="Underline"
                          onClick={() =>
                            handleInputChange(
                              category,
                              "description",
                              (categoryData[category]?.description || "") +
                                "<u>Underline</u>"
                            )
                          }
                          disabled={loading}
                          aria-disabled={loading}
                        >
                          <u>U</u>
                        </button>
                        <select
                          onChange={(e) =>
                            handleInputChange(
                              category,
                              "description",
                              (categoryData[category]?.description || "") +
                                `<span style="font-size: ${e.target.value}px">${e.target.value}px</span>`
                            )
                          }
                          className="px-2 py-1 bg-[#222] border border-[#d7a95f] rounded-md text-white res__font"
                          disabled={loading}
                          aria-disabled={loading}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Font Size
                          </option>
                          <option value="12">Small (12px)</option>
                          <option value="16">Medium (16px)</option>
                          <option value="20">Large (20px)</option>
                        </select>
                        <button
                          type="button"
                          className="px-2 py-1 text-[#d7a95f] hover:bg-[#d7a95f] hover:text-white rounded"
                          title="Unordered List"
                          onClick={() =>
                            handleInputChange(
                              category,
                              "description",
                              (categoryData[category]?.description || "") +
                                "<ul><li>Item</li></ul>"
                            )
                          }
                          disabled={loading}
                          aria-disabled={loading}
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-[#d7a95f] hover Turtlebg-[#d7a95f] hover:text-white rounded"
                          title="Ordered List"
                          onClick={() =>
                            handleInputChange(
                              category,
                              "description",
                              (categoryData[category]?.description || "") +
                                "<ol><li>Item</li></ol>"
                            )
                          }
                          disabled={loading}
                          aria-disabled={loading}
                        >
                          1. List
                        </button>
                      </div>
                      <textarea
                        id={`description-${category}`}
                        value={categoryData[category]?.description || ""}
                        onChange={(e) =>
                          handleInputChange(
                            category,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full p-3 bg-[#222] text-white rounded-b-md focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font min-h-[150px] resize-y"
                        placeholder="Enter food description..."
                        disabled={loading}
                        aria-disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor={`images-${category}`}
                      className="block text-sm font-medium text-white res__font"
                    >
                      Images (Up to 2)
                    </label>
                    <div
                      className="mt-1 p-4 bg-[#222] border border-[#d7a95f] rounded-md text-center cursor-pointer"
                      onClick={() => fileInputRefs.current[category]?.click()}
                      aria-label={`Upload images for ${category}`}
                    >
                      <p className="text-[#d7a95f] res__font">
                        {categoryData[category]?.imagePreviews.length === 0
                          ? "Click to upload or drag and drop images"
                          : "Click to add more images"}
                      </p>
                      <input
                        id={`images-${category}`}
                        type="file"
                        accept="image/jpeg,image/png"
                        multiple
                        onChange={(e) => handleImageChange(category, e)}
                        className="hidden"
                        ref={(el) => {
                          fileInputRefs.current[category] = el;
                        }}
                        disabled={
                          loading || categoryData[category]?.images.length >= 2
                        }
                        aria-disabled={
                          loading || categoryData[category]?.images.length >= 2
                        }
                      />
                    </div>
                    <div className="flex gap-4 mt-2 flex-wrap">
                      {categoryData[category]?.imagePreviews.map(
                        (preview, index) => (
                          <div key={index} className="relative">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              width={100}
                              height={100}
                              className="object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(category, index)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              disabled={loading}
                              aria-disabled={loading}
                              aria-label={`Remove image ${index + 1}`}
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  {(category === "Pizza" ||
                    category === "Pasta" ||
                    foodType === "fried_food") && (
                    <div>
                      <label className="block text-sm font-medium text-white res__font">
                        Sizes
                      </label>
                      <div className="mt-2 flex flex-wrap gap-4">
                        {(category === "Pizza" ? pizzaSizes : plateSizes).map(
                          (size) => (
                            <label
                              key={size}
                              className="flex items-center gap-2 res__font"
                              aria-label={`Select ${size} size`}
                            >
                              <input
                                type="checkbox"
                                checked={categoryData[category]?.sizes.some(
                                  (s) => s.size === size
                                )}
                                onChange={() =>
                                  handleSizeToggle(category, size)
                                }
                                disabled={loading}
                                className="form-checkbox h-5 w-5 text-[#d7a95f] border-[#d7a95f] focus:ring-[#d7a95f]"
                                aria-disabled={loading}
                              />
                              <span className="text-white">{size}</span>
                            </label>
                          )
                        )}
                      </div>
                      {categoryData[category]?.sizes.map((size, index) => (
                        <div
                          key={index}
                          className="flex gap-4 items-center mt-4"
                        >
                          <input
                            type="text"
                            value={size.size}
                            readOnly
                            className="flex-1 px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white res__font"
                            aria-label={`Size: ${size.size}`}
                          />
                          <input
                            type="number"
                            value={size.price}
                            onChange={(e) =>
                              handleSizeChange(
                                category,
                                index,
                                "price",
                                e.target.value
                              )
                            }
                            placeholder="Price"
                            className="flex-1 px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                            required
                            disabled={loading}
                            aria-disabled={loading}
                            aria-label={`Price for ${size.size}`}
                          />
                          <input
                            type="number"
                            value={size.cutPrice || ""}
                            onChange={(e) =>
                              handleSizeChange(
                                category,
                                index,
                                "cutPrice",
                                e.target.value
                              )
                            }
                            placeholder="Cut Price (Optional)"
                            className="flex-1 px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                            disabled={loading}
                            aria-disabled={loading}
                            aria-label={`Cut price for ${size.size}`}
                          />
                        </div>
                      ))}
                      {categoryData[category]?.sizes.map((size, index) => (
                        <div key={index} className="mt-2">
                          <p className="text-[#d7a95f] res__font">
                            {size.size}: Rs {size.price}
                            {size.cutPrice && size.cutPrice > size.price ? (
                              <>
                                {" "}
                                (
                                {calculatePercentOff(size.price, size.cutPrice)}
                                % Off, Save Rs{" "}
                                {calculateSavePrice(size.price, size.cutPrice)})
                              </>
                            ) : null}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {(category === "Burger" || category === "Fries") && (
                    <div>
                      <label
                        htmlFor={`price-${category}`}
                        className="block text-sm font-medium text-white res__font"
                      >
                        Price
                      </label>
                      <input
                        id={`price-${category}`}
                        type="number"
                        value={categoryData[category]?.sizes[0]?.price || ""}
                        onChange={(e) =>
                          handleInputChange(category, "sizes", [
                            {
                              size: "Single",
                              price: Number(e.target.value),
                              cutPrice:
                                categoryData[category]?.sizes[0]?.cutPrice,
                            },
                          ])
                        }
                        className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                        required
                        disabled={loading}
                        aria-disabled={loading}
                      />
                      <label
                        htmlFor={`cutPrice-${category}`}
                        className="block text-sm font-medium text-white res__font mt-2"
                      >
                        Cut Price (Optional)
                      </label>
                      <input
                        id={`cutPrice-${category}`}
                        type="number"
                        value={categoryData[category]?.sizes[0]?.cutPrice || ""}
                        onChange={(e) =>
                          handleInputChange(category, "sizes", [
                            {
                              size: "Single",
                              price:
                                categoryData[category]?.sizes[0]?.price || 0,
                              cutPrice: Number(e.target.value) || undefined,
                            },
                          ])
                        }
                        className="mt-1 block w-full px-3 py-2 bg-[#222] border border-[#d7a95f] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#d7a95f] res__font"
                        disabled={loading}
                        aria-disabled={loading}
                      />
                      {categoryData[category]?.sizes[0]?.price &&
                      categoryData[category]?.sizes[0]?.cutPrice &&
                      categoryData[category]?.sizes[0].cutPrice >
                        categoryData[category]?.sizes[0].price ? (
                        <div className="mt-2">
                          <p className="text-[#d7a95f] res__font">
                            {calculatePercentOff(
                              categoryData[category].sizes[0].price,
                              categoryData[category].sizes[0].cutPrice
                            )}
                            % Off
                          </p>
                          <p className="text-[#d7a95f] res__font">
                            Save Rs{" "}
                            {calculateSavePrice(
                              categoryData[category].sizes[0].price,
                              categoryData[category].sizes[0].cutPrice
                            )}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              type="submit"
              className="w-full font-bold text-md sm:text-xl relative overflow-hidden border border-[#d7a95f] text-[#d7a95f] px-6 py-2 transition-all duration-500 ease-in-out group disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              aria-disabled={loading}
              aria-label={loading ? "Adding food" : "Add food"}
            >
              <span className="absolute inset-0 bg-[#d7a95f] w-full h-0 group-hover:h-full bottom-0 left-0 transition-all duration-500 ease-in-out z-0"></span>
              <span className="relative z-10 group-hover:text-white">
                {loading ? "Adding..." : "Add Food"}
              </span>
            </button>
          </>
        ) : null}
      </form>
    </div>
  );
}

import { ProductRepository } from "../repositories/productRepository";
import type { ProductCreateDTO, ProductUpdateDTO, ProductQueryDTO } from "../dtos/product.dto";
import type { Prisma } from "@prisma/client";
import { kStringMaxLength } from "buffer";

export class ProductService {
  private repo = new ProductRepository();

  async create(userId: number, data: ProductCreateDTO) {
    return this.repo.createProduct({ ...data, userId });
  }

  async list({ page, pageSize, keyword }: ProductQueryDTO) {
    const where: Prisma.ProductWhereInput = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {};
    return this.repo.findMany(where, (page - 1) * pageSize, pageSize);
  }

  async getDetail(id: number) {
    return this.repo.findById(id);
  }

  async update(userId: number, productId: number, data: ProductUpdateDTO) {
    const product = await this.repo.findById(productId);
    if (!product) throw new Error("NOT_FOUND");
    if (product.userId !== userId) throw new Error("FORBIDDEN");

    const updateData: Record<string, string | number> = {
    ...(data?.name && { name: data.name }),
    ...(data?.description && { description: data.description }),
    ...(typeof data?.price === "number" && { price: data.price }),
    ...(data?.tags && { tags: data.tags }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new Error("NO_DATA");
    }
    return this.repo.updateProduct(productId, updateData);
  }

  async delete(userId: number, productId: number) {
    const product = await this.repo.findById(productId);
    if (!product) throw new Error("NOT_FOUND");
    if (product.userId !== userId) throw new Error("FORBIDDEN");

    await this.repo.deleteProduct(productId);
  }
}